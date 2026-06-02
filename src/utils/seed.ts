import type { ResourceMode } from "../types";
import popularReleases from "../data/popular-releases.json";
import popularArtists from "../data/popular-artists.json";

function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
  }
  return Math.abs(h);
}

function getList(mode: ResourceMode): string[] {
  return mode === "release"
    ? (popularReleases as string[])
    : (popularArtists as string[]);
}

export function getDailyIndex(
  date: string,
  mode: ResourceMode,
  listLength: number
): number {
  return hash(`${date}:${mode}`) % listLength;
}

export function getDailyMbid(date: string, mode: ResourceMode): string {
  const list = getList(mode);
  return list[getDailyIndex(date, mode, list.length)];
}

export function getRandomMbid(mode: ResourceMode): string {
  const list = getList(mode);
  return list[Math.floor(Math.random() * list.length)];
}
