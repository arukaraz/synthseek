import type { HashHrefParts } from "./types";

export function splitHashHref(href: string): HashHrefParts {
  const separator = href.indexOf("#");
  if (separator === -1) return { path: href, hash: "" };

  return { path: href.slice(0, separator), hash: href.slice(separator + 1) };
}

export function pathnameOf(href: string): string {
  const { path } = splitHashHref(href);
  const query = path.indexOf("?");
  return query === -1 ? path : path.slice(0, query);
}
