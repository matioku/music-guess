interface DiscogsResult {
  cover_image?: string;
}

interface DiscogsResponse {
  results: DiscogsResult[];
}

export async function fetchFromDiscogs(
  title: string,
  artist: string
): Promise<string | null> {
  const token = import.meta.env.VITE_DISCOGS_TOKEN as string | undefined;
  if (!token) return null;
  const q = encodeURIComponent(`${title} ${artist}`);
  const res = await fetch(
    `https://api.discogs.com/database/search?q=${q}&type=release&token=${token}`
  );
  if (!res.ok) return null;
  const data = (await res.json()) as DiscogsResponse;
  return data.results[0]?.cover_image ?? null;
}
