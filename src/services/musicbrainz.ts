import type { Artist, ReleaseGroup, SearchResult } from "../types/index";

const BASE_URL = "https://musicbrainz.org/ws/2";
const USER_AGENT = "UnJourUneRessource/1.0 (contact@example.com)";

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

// --- Utilitaire interne ---

async function mbFetch<T>(
  path: string,
  params: Record<string, string>
): Promise<T> {
  const url = new URL(`${BASE_URL}/${path}`);
  Object.entries({ ...params, fmt: "json" }).forEach(([k, v]) =>
    url.searchParams.set(k, v)
  );
  const res = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) throw new Error(`MusicBrainz ${res.status}`);
  return res.json() as Promise<T>;
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
  query: string
): Promise<SearchResult[]> {
  const data = await mbFetch<MBReleaseGroupSearchResponse>("release-group", {
    query,
    limit: "10",
  });
  return data["release-groups"].map(mapReleaseGroupToSearchResult);
}

export async function getReleaseGroup(mbid: string): Promise<ReleaseGroup> {
  const data = await mbFetch<MBReleaseGroup>(`release-group/${mbid}`, {
    inc: "artist-credits+releases+tags",
  });
  return mapReleaseGroup(data);
}

export async function searchArtists(query: string): Promise<SearchResult[]> {
  const data = await mbFetch<MBArtistSearchResponse>("artist", {
    query,
    limit: "10",
  });
  return data.artists.map(mapArtistToSearchResult);
}

export async function getArtist(mbid: string): Promise<Artist> {
  const data = await mbFetch<MBArtist>(`artist/${mbid}`, { inc: "tags" });
  return mapArtist(data);
}
