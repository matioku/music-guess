interface DiscogsResult {
  cover_image?: string;
  thumb?: string;
}

interface DiscogsResponse {
  results: DiscogsResult[];
}

interface DiscogsArtistImage {
  type?: string;
  uri?: string;
  uri150?: string;
}

interface DiscogsArtistResponse {
  images?: DiscogsArtistImage[];
}

function discogsToken(): string | undefined {
  return import.meta.env.VITE_DISCOGS_TOKEN as string | undefined;
}

export async function fetchFromDiscogs(
  title: string,
  artist: string
): Promise<string | null> {
  const token = discogsToken();
  if (!token) return null;
  const q = encodeURIComponent(`${title} ${artist}`);
  const res = await fetch(
    `https://api.discogs.com/database/search?q=${q}&type=release&token=${token}`
  );
  if (!res.ok) return null;
  const data = (await res.json()) as DiscogsResponse;
  return data.results[0]?.cover_image ?? null;
}

// Artist photo fallback. Prefers an exact lookup by Discogs artist id (taken
// from a MusicBrainz "discogs" relationship) and otherwise searches by name.
export async function fetchArtistImageFromDiscogs(
  name: string,
  discogsId?: string
): Promise<string | null> {
  const token = discogsToken();
  if (!token) return null;
  try {
    if (discogsId) {
      const res = await fetch(
        `https://api.discogs.com/artists/${discogsId}?token=${token}`
      );
      if (res.ok) {
        const data = (await res.json()) as DiscogsArtistResponse;
        const images = data.images ?? [];
        const primary = images.find((i) => i.type === "primary") ?? images[0];
        if (primary?.uri) return primary.uri;
      }
    }
    if (!name) return null;
    const res = await fetch(
      `https://api.discogs.com/database/search?q=${encodeURIComponent(
        name
      )}&type=artist&token=${token}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as DiscogsResponse;
    return data.results[0]?.cover_image ?? data.results[0]?.thumb ?? null;
  } catch {
    return null;
  }
}
