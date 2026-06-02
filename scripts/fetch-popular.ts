/**
 * One-shot script — populates src/data/popular-releases.json and
 * src/data/popular-artists.json with ~500 MusicBrainz MBIDs each.
 *
 * Usage: bun fetch-popular
 * Runtime: ~2 min (5 paginated requests per entity type, rate-limited to 1 req/s)
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const BASE_URL = "https://musicbrainz.org/ws/2";
const USER_AGENT = "UnJourUneRessource/1.0 (contact@example.com)";
const LIMIT = 100;
const TARGET = 500;
const DELAY_MS = 1100;

const TAGS = [
  "rock", "pop", "hip-hop", "jazz", "electronic",
  "classical", "metal", "soul", "country", "blues",
  "reggae", "punk", "indie", "folk", "disco",
  "funk", "latin", "ambient",
];

const TAG_QUERY = TAGS.map(t => `tag:${t}`).join(" OR ");

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function get(path: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (res.status === 503) {
    console.warn("  503 — waiting 5s before retry...");
    await sleep(5000);
    return get(path);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${BASE_URL}${path}`);
  return res.json();
}

async function collectMbids(
  entity: "release-group" | "artist",
  arrayKey: "release-groups" | "artists"
): Promise<string[]> {
  const mbids = new Set<string>();

  for (let offset = 0; offset < TARGET; offset += LIMIT) {
    process.stdout.write(
      `  [${entity}] offset=${String(offset).padStart(3)}  collected=${mbids.size}\r`
    );

    const data = await get(
      `/${entity}?query=${encodeURIComponent(TAG_QUERY)}&limit=${LIMIT}&offset=${offset}&fmt=json`
    ) as Record<string, unknown>;

    const items = (data[arrayKey] as Array<{ id?: string }>) ?? [];
    if (items.length === 0) break;

    for (const item of items) {
      if (item.id) mbids.add(item.id);
    }

    if (offset + LIMIT < TARGET) await sleep(DELAY_MS);
  }

  process.stdout.write("\n");
  return Array.from(mbids).slice(0, TARGET);
}

async function main() {
  const dataDir = join(import.meta.dir, "..", "src", "data");
  mkdirSync(dataDir, { recursive: true });

  console.log(`Fetching release-group MBIDs (target: ${TARGET})...`);
  const releases = await collectMbids("release-group", "release-groups");
  writeFileSync(join(dataDir, "popular-releases.json"), JSON.stringify(releases, null, 2));
  console.log(`✓ popular-releases.json — ${releases.length} MBIDs`);

  console.log(`\nFetching artist MBIDs (target: ${TARGET})...`);
  const artists = await collectMbids("artist", "artists");
  writeFileSync(join(dataDir, "popular-artists.json"), JSON.stringify(artists, null, 2));
  console.log(`✓ popular-artists.json — ${artists.length} MBIDs`);
}

main().catch(err => { console.error(err); process.exit(1); });
