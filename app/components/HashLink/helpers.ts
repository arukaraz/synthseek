import type { HashHrefParts } from "./types";

export function splitHashHref(href: string): HashHrefParts {
  const separator = href.indexOf("#");
  if (separator === -1) return { path: href, hash: "" };

  return { path: href.slice(0, separator), hash: href.slice(separator + 1) };
}
