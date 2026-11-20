const NON_SLUG_RUN = /[^a-z0-9]+/g;
const EDGE_DASHES = /^-+|-+$/g;
const FALLBACK_SLUG = "playlist";

export function collectionFilename(name: string, extension: string): string {
  const slug = name.trim().toLowerCase().replace(NON_SLUG_RUN, "-").replace(EDGE_DASHES, "") || FALLBACK_SLUG;
  return `${slug}.${extension}`;
}
