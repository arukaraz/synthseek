export const RETURN_PATH_PARAM = "next";
export const HOME_PATH = "/";
export const LOGIN_PATH = "/login";
export const SETUP_PATH = "/setup";

const RETURN_PATH_MAX_LENGTH = 2048;
const PARSE_BASE = "http://return-path.invalid";
const AUTH_ROUTES: readonly string[] = [LOGIN_PATH];

function hasControlCharacter(value: string): boolean {
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) return true;
  }
  return false;
}

export function isSafeReturnPath(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (value.length === 0 || value.length > RETURN_PATH_MAX_LENGTH) return false;
  if (value[0] !== "/" || value[1] === "/") return false;
  if (value.includes("\\") || hasControlCharacter(value)) return false;

  try {
    const parsed = new URL(value, PARSE_BASE);
    if (parsed.origin !== PARSE_BASE) return false;
    const pathname = decodeURIComponent(parsed.pathname);
    return !AUTH_ROUTES.some((route) => pathname === route || pathname === `${route}/`);
  } catch {
    return false;
  }
}

export function returnPathOf(search: string): string {
  const requested = new URLSearchParams(search).get(RETURN_PATH_PARAM);
  return isSafeReturnPath(requested) ? requested : HOME_PATH;
}

export interface BrowserLocation {
  pathname: string;
  search: string;
  hash: string;
}

export function loginHrefToSetup(): string {
  return `${LOGIN_PATH}?${RETURN_PATH_PARAM}=${encodeURIComponent(SETUP_PATH)}`;
}

export function loginHrefFor(location: BrowserLocation): string {
  const current = `${location.pathname}${location.search}${location.hash}`;
  if (current === HOME_PATH || !isSafeReturnPath(current)) return LOGIN_PATH;
  return `${LOGIN_PATH}?${RETURN_PATH_PARAM}=${encodeURIComponent(current)}`;
}
