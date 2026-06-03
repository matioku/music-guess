import type { Artist, ReleaseGroup, SearchResult } from "../types/index";

const BASE_URL = "https://musicbrainz.org/ws/2";

// MusicBrainz allows ~1 request/second per IP; bursting returns 503 (which the
// browser surfaces as an opaque "CORS request failed"). We space request STARTS
// at least MIN_INTERVAL_MS apart, but deliberately do NOT chain on each other's
// completion — a single slow/stalled request must not block later ones
// (head-of-line blocking). Each request also has its own timeout so a stalled
// connection cannot pin a slot. Identical in-flight requests are deduped
// (single-flight) and successful responses cached for the session. Note: no
// User-Agent header — it is forbidden in browsers (ignored) and only risks an
// extra preflight round-trip.
const MIN_INTERVAL_MS = 1100; // keep a margin above the 1 req/s ceiling
const REQUEST_TIMEOUT_MS = 8000; // a stalled request fails instead of hanging
const MAX_RETRIES = 3;

let nextSlotAt = 0;

const inFlight = new Map<string, Promise<unknown>>();
const responseCache = new Map<string, unknown>();

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });
}

// Reserve the next time slot. Spacing is based on request START times, so a
// reserved slot is never released by waiting on a previous request to finish.
function reserveSlot(): number {
  const now = Date.now();
  const slot = Math.max(now, nextSlotAt);
  nextSlotAt = slot + MIN_INTERVAL_MS;
  return slot;
}

async function scheduledFetch(url: string, signal?: AbortSignal): Promise<Response> {
  const slot = reserveSlot();
  const wait = slot - Date.now();
  if (wait > 0) await delay(wait, signal);
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  return fetch(url, { signal: combined });
}

// --- Types bruts API MusicBrainz (privés) ---

interface MBTag {
  name: string;
  count: number;
}

interface MBLabelInfo {
  label: { id: string; name: string };
}

interface MBRelease {
  id: string;
  country: string | null;
  "label-info": MBLabelInfo[];
}

interface MBArtistCredit {
  name: string;
  artist: { id: string; name: string };
}

interface MBReleaseGroup {
  id: string;
  title: string;
  "primary-type": string | null;
  "secondary-types": string[];
  "first-release-date": string;
  "artist-credit": MBArtistCredit[];
  releases: MBRelease[];
  tags: MBTag[];
}

interface MBReleaseGroupSearchResponse {
  "release-groups": MBReleaseGroup[];
}

interface MBArea {
  name: string;
}

interface MBLifeSpan {
  begin: string | null;
  end: string | null;
  ended: boolean;
}

interface MBArtist {
  id: string;
  name: string;
  type: string | null;
  country: string | null;
  area: MBArea | null;
  "life-span": MBLifeSpan;
  tags: MBTag[];
}

interface MBArtistSearchResponse {
  artists: MBArtist[];
}

interface MBRelation {
  type: string;
  url?: { resource: string };
}

interface MBArtistRelationsResponse {
  relations?: MBRelation[];
}

// --- Utilitaire interne ---

async function mbFetch<T>(
  path: string,
  params: Record<string, string>,
  signal?: AbortSignal
): Promise<T> {
  const url = new URL(`${BASE_URL}/${path}`);
  Object.entries({ ...params, fmt: "json" }).forEach(([k, v]) =>
    url.searchParams.set(k, v)
  );
  const key = url.toString();

  if (responseCache.has(key)) return responseCache.get(key) as T;
  // Only dedupe unsignalled requests: a cancellable caller must own its own
  // request so its abort cannot reject a shared promise used by others.
  if (!signal) {
    const pending = inFlight.get(key);
    if (pending) return pending as Promise<T>;
  }

  const request = (async (): Promise<T> => {
    let lastError: unknown = new Error("MusicBrainz request failed");
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await scheduledFetch(key, signal);
        if (res.status === 503) {
          // Rate limited. Honour Retry-After when present, else back off.
          const retryAfter = Number(res.headers.get("retry-after"));
          const backoff =
            Number.isFinite(retryAfter) && retryAfter > 0
              ? retryAfter * 1000
              : MIN_INTERVAL_MS * (attempt + 1);
          lastError = new Error("MusicBrainz 503 (rate limited)");
          await delay(backoff, signal);
          continue;
        }
        if (!res.ok) throw new Error(`MusicBrainz ${res.status}`);
        const json = (await res.json()) as T;
        responseCache.set(key, json);
        return json;
      } catch (err) {
        // Caller cancelled — propagate immediately, never retry.
        if (signal?.aborted) throw err;
        // Network/CORS/timeout error: retry with backoff while attempts remain.
        lastError = err;
        if (attempt < MAX_RETRIES) await delay(MIN_INTERVAL_MS * (attempt + 1));
      }
    }
    throw lastError;
  })();

  if (!signal) {
    inFlight.set(key, request);
    request.then(
      () => inFlight.delete(key),
      () => inFlight.delete(key)
    );
  }
  return request;
}

// --- Mapping helpers ---

function mapReleaseGroupToSearchResult(rg: MBReleaseGroup): SearchResult {
  const year = rg["first-release-date"]?.slice(0, 4);
  const artist = rg["artist-credit"][0]?.name ?? "";
  return {
    mbid: rg.id,
    title: rg.title,
    subtitle: [artist, year].filter(Boolean).join(" • "),
  };
}

function mapReleaseGroup(rg: MBReleaseGroup): ReleaseGroup {
  const topTags = (rg.tags ?? [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((t) => t.name);
  return {
    kind: "release",
    mbid: rg.id,
    title: rg.title,
    artist: rg["artist-credit"][0]?.name ?? "",
    artistMbid: rg["artist-credit"][0]?.artist.id ?? "",
    year: rg["first-release-date"]
      ? parseInt(rg["first-release-date"].slice(0, 4), 10)
      : null,
    primaryType: rg["primary-type"] ?? null,
    secondaryTypes: rg["secondary-types"] ?? [],
    country: rg.releases?.[0]?.country ?? null,
    label: rg.releases?.[0]?.["label-info"]?.[0]?.label?.name ?? null,
    tags: topTags,
    coverArtUrl: null,
  };
}

function mapArtistToSearchResult(a: MBArtist): SearchResult {
  return {
    mbid: a.id,
    title: a.name,
    subtitle: [a.type, a.country].filter(Boolean).join(" • "),
  };
}

function mapArtist(a: MBArtist): Artist {
  const topTags = (a.tags ?? [])
    .sort((x, y) => y.count - x.count)
    .slice(0, 3)
    .map((t) => t.name);
  return {
    kind: "artist",
    mbid: a.id,
    name: a.name,
    type: a.type ?? null,
    country: a.country ?? null,
    area: a.area?.name ?? null,
    careerStart: a["life-span"]?.begin
      ? parseInt(a["life-span"].begin.slice(0, 4), 10)
      : null,
    careerEnd: a["life-span"]?.end
      ? parseInt(a["life-span"].end.slice(0, 4), 10)
      : null,
    tags: topTags,
    imageUrl: null,
  };
}

// --- API publique ---

export async function searchReleaseGroups(
  query: string,
  signal?: AbortSignal
): Promise<SearchResult[]> {
  const data = await mbFetch<MBReleaseGroupSearchResponse>(
    "release-group",
    { query, limit: "10" },
    signal
  );
  return data["release-groups"].map(mapReleaseGroupToSearchResult);
}

export async function getReleaseGroup(mbid: string): Promise<ReleaseGroup> {
  const data = await mbFetch<MBReleaseGroup>(`release-group/${mbid}`, {
    inc: "artist-credits+releases+tags",
  });
  return mapReleaseGroup(data);
}

export async function searchArtists(
  query: string,
  signal?: AbortSignal
): Promise<SearchResult[]> {
  const data = await mbFetch<MBArtistSearchResponse>(
    "artist",
    { query, limit: "10" },
    signal
  );
  return data.artists.map(mapArtistToSearchResult);
}

export async function getArtist(mbid: string): Promise<Artist> {
  const data = await mbFetch<MBArtist>(`artist/${mbid}`, { inc: "tags" });
  return mapArtist(data);
}

// External URL relationships of an artist (used to resolve a photo, since
// MusicBrainz/Cover Art Archive host album art only, not artist images).
export async function getArtistRelations(
  mbid: string,
  signal?: AbortSignal
): Promise<{ type: string; resource: string }[]> {
  const data = await mbFetch<MBArtistRelationsResponse>(
    `artist/${mbid}`,
    { inc: "url-rels" },
    signal
  );
  return (data.relations ?? [])
    .filter((r): r is MBRelation & { url: { resource: string } } => !!r.url?.resource)
    .map((r) => ({ type: r.type, resource: r.url.resource }));
}
