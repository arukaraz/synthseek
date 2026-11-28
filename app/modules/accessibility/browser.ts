import {
  ACCESSIBILITY_ATTRIBUTE_NAMES,
  ACCESSIBILITY_ATTRIBUTES,
  ACCESSIBILITY_COOKIE,
  ACCESSIBILITY_COOKIE_MAX_AGE_SECONDS,
  ACCESSIBILITY_GUEST_COOKIE,
  ACCESSIBILITY_GUEST_MARKER,
  ATTRIBUTE_ON,
  MORE_CONTRAST_QUERY,
  REDUCED_MOTION_QUERY,
  TEXT_SIZE_ATTRIBUTE,
  TEXT_SIZE_COOKIE,
} from "./constants";
import {
  accessibilityAttributesOf,
  parseAccessibilityCookie,
  parseTextSize,
  preferenceOfAttribute,
  resolveMoreContrast,
  resolveMotionReduced,
  resolveTransparencyReduced,
  serializeAccessibilityCookie,
  textSizeAttributesOf,
} from "./helpers";
import type { AccessibilityCookie, ResolvedAccessibility, TextSize } from "./types";

const OBSERVED_QUERIES = [REDUCED_MOTION_QUERY, MORE_CONTRAST_QUERY] as const;

function hasBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function deviceAsks(query: string): boolean {
  return hasBrowser() && typeof window.matchMedia === "function" && window.matchMedia(query).matches;
}

function cookieValueOf(cookieHeader: string, name: string): string | undefined {
  for (const pair of cookieHeader.split(";")) {
    const entry = pair.trim();
    const separator = entry.indexOf("=");
    if (separator !== -1 && entry.slice(0, separator) === name) return entry.slice(separator + 1);
  }
  return undefined;
}

export function readAccessibilityCookie(target: Document = document): AccessibilityCookie {
  return parseAccessibilityCookie(cookieValueOf(target.cookie, ACCESSIBILITY_COOKIE));
}

export function writeGuestAccessibilityCookies(values: AccessibilityCookie, target: Document = document): void {
  const secure = target.location.protocol === "https:" ? "; Secure" : "";
  const attributes = `; Path=/; Max-Age=${ACCESSIBILITY_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
  target.cookie = `${ACCESSIBILITY_COOKIE}=${serializeAccessibilityCookie(values)}${attributes}`;
  target.cookie = `${ACCESSIBILITY_GUEST_COOKIE}=${ACCESSIBILITY_GUEST_MARKER}${attributes}`;
}

export function readTextSize(target: Document = document): TextSize {
  return parseTextSize(cookieValueOf(target.cookie, TEXT_SIZE_COOKIE));
}

export function writeTextSize(size: TextSize, target: Document = document): void {
  const secure = target.location.protocol === "https:" ? "; Secure" : "";
  target.cookie = `${TEXT_SIZE_COOKIE}=${size}; Path=/; Max-Age=${ACCESSIBILITY_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function applyTextSize(root: HTMLElement, size: TextSize): void {
  const wanted = textSizeAttributesOf(size)[TEXT_SIZE_ATTRIBUTE];
  if (wanted === undefined) root.removeAttribute(TEXT_SIZE_ATTRIBUTE);
  else root.setAttribute(TEXT_SIZE_ATTRIBUTE, wanted);
}

export function applyAccessibilityAttributes(root: HTMLElement, values: AccessibilityCookie): void {
  const wanted = accessibilityAttributesOf(values);
  for (const name of ACCESSIBILITY_ATTRIBUTE_NAMES) {
    const value = wanted[name];
    if (value === undefined) root.removeAttribute(name);
    else root.setAttribute(name, value);
  }
}

export function readResolvedAccessibility(): ResolvedAccessibility {
  if (!hasBrowser()) return { motionReduced: false, transparencyReduced: false, moreContrast: false };
  const root = document.documentElement;
  const motionReduced = resolveMotionReduced(
    preferenceOfAttribute(root.getAttribute(ACCESSIBILITY_ATTRIBUTES.motion)),
    deviceAsks(REDUCED_MOTION_QUERY)
  );
  const mode = root.getAttribute(ACCESSIBILITY_ATTRIBUTES.mode) === ATTRIBUTE_ON;
  return {
    motionReduced,
    transparencyReduced: resolveTransparencyReduced(
      preferenceOfAttribute(root.getAttribute(ACCESSIBILITY_ATTRIBUTES.transparency)),
      motionReduced
    ),
    moreContrast: resolveMoreContrast(
      preferenceOfAttribute(root.getAttribute(ACCESSIBILITY_ATTRIBUTES.contrast)),
      mode,
      deviceAsks(MORE_CONTRAST_QUERY)
    ),
  };
}

export function readMotionReduced(): boolean {
  return readResolvedAccessibility().motionReduced;
}

export function subscribeAccessibility(onChange: () => void): () => void {
  if (!hasBrowser()) return () => undefined;
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [...ACCESSIBILITY_ATTRIBUTE_NAMES] });
  const lists =
    typeof window.matchMedia === "function" ? OBSERVED_QUERIES.map((query) => window.matchMedia(query)) : [];
  for (const list of lists) list.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    for (const list of lists) list.removeEventListener("change", onChange);
  };
}
