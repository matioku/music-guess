import { getArtistRelations } from "./musicbrainz";

// MusicBrainz hosts no images, but artists carry URL relationships pointing to
// Wikimedia Commons / Wikidata. We resolve those to a displayable photo URL.
// All image URLs end up as Commons "Special:FilePath" links, which 302 to the
// actual file on upload.wikimedia.org and render fine in an <img> (no CORS).

const COMMONS_WIDTH = 320;

function filePathUrl(filename: string): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
    filename
  )}?width=${COMMONS_WIDTH}`;
}

// Turn a Commons "File:" page URL into a direct file URL.
function fromCommonsPageUrl(resource: string): string | null {
  const m = resource.match(/commons\.wikimedia\.org\/wiki\/(.+)$/i);
  if (!m) return null;
  const name = decodeURIComponent(m[1]).replace(/^File:/i, "");
  return filePathUrl(name);
}

// Fallback: resolve the artist's Wikidata entity image (property P18). Uses the
// action API with origin=* so the cross-origin GET is allowed.
async function imageFromWikidata(qid: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${qid}&property=P18&format=json&origin=*`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      claims?: { P18?: { mainsnak?: { datavalue?: { value?: string } } }[] };
    };
    const filename = data.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    return filename ? filePathUrl(filename) : null;
  } catch {
    return null;
  }
}

export async function getArtistImage(mbid: string): Promise<string | null> {
  let relations: { type: string; resource: string }[];
  try {
    relations = await getArtistRelations(mbid);
  } catch {
    return null;
  }

  // Prefer an explicit "image" relationship.
  const image = relations.find((r) => r.type === "image");
  if (image) return fromCommonsPageUrl(image.resource) ?? image.resource;

  // Otherwise derive it from the linked Wikidata entity.
  const wikidata = relations.find((r) => r.type === "wikidata");
  const qid = wikidata?.resource.match(/(Q\d+)/)?.[1];
  if (qid) return imageFromWikidata(qid);

  return null;
}
