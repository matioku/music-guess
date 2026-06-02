import { fetchFromCAA } from "./coverArtArchive";
import { fetchFromDiscogs } from "./discogs";

export async function getCoverArt(
  mbid: string,
  title: string,
  artist: string
): Promise<string | null> {
  const caa = await fetchFromCAA(mbid);
  if (caa) return caa;
  return fetchFromDiscogs(title, artist);
}
