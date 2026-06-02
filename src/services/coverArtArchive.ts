interface CAAImage {
  types: string[];
  image: string;
}

interface CAAResponse {
  images: CAAImage[];
}

export async function fetchFromCAA(mbid: string): Promise<string | null> {
  const res = await fetch(`https://coverartarchive.org/release-group/${mbid}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Cover Art Archive ${res.status}`);
  const data = (await res.json()) as CAAResponse;
  return data.images.find((img) => img.types.includes("Front"))?.image ?? null;
}
