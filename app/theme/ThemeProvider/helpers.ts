import type { ThemePresetId, ThemeScheme } from "@theme/contract";

import {
  FACTORY_BOOT,
  PRESET_THEMES,
  SAFE_THEME_PARAM,
  SAFE_THEME_VALUE,
  THEME_ATTRIBUTE,
  THEME_BASE_ATTRIBUTE,
  THEME_CHANGE_EVENT,
  THEME_COOKIE_SEPARATOR,
  THEME_DRAFT_ID,
  THEME_FINGERPRINT_LENGTH,
  THEME_SHEET_ID,
  THEME_SHEET_PATH,
  THEME_SHEET_PENDING_ATTRIBUTE,
} from "./constants";
import type { CustomThemeSummary, Theme, ThemeBoot } from "./types";

const HEX_DIGITS = "0123456789abcdef";
const SETTLED_SHEET = `link#${THEME_SHEET_ID}`;
const PENDING_SHEET = `link[${THEME_SHEET_PENDING_ATTRIBUTE}]`;
const latestPaint = new WeakMap<Document, () => void>();

function isFingerprint(value: string | undefined): value is string {
  return (
    value !== undefined &&
    value.length === THEME_FINGERPRINT_LENGTH &&
    [...value].every((character) => HEX_DIGITS.includes(character))
  );
}

function isScheme(value: string | undefined): value is ThemeScheme {
  return value === "dark" || value === "light";
}

function presetOf(value: string | undefined): ThemePresetId | null {
  return PRESET_THEMES.find((preset) => preset === value) ?? null;
}

export function parseThemeCookie(value: string | undefined): ThemeBoot {
  if (value === undefined) return FACTORY_BOOT;
  const [theme, base, scheme, fingerprint] = value.split(THEME_COOKIE_SEPARATOR);
  const preset = presetOf(theme);
  if (preset !== null) return { theme: preset, base: preset, scheme: "dark", fingerprint: null };
  const startedFrom = presetOf(base);
  if (theme !== "custom" || startedFrom === null || !isScheme(scheme) || !isFingerprint(fingerprint)) {
    return FACTORY_BOOT;
  }
  return { theme: "custom", base: startedFrom, scheme, fingerprint };
}

export function bootOf(theme: Theme, custom: CustomThemeSummary | null): ThemeBoot {
  if (theme !== "custom") return { theme, base: theme, scheme: "dark", fingerprint: null };
  if (custom === null) return FACTORY_BOOT;
  return { theme, base: custom.startedFrom, scheme: custom.scheme, fingerprint: custom.fingerprint };
}

export function sheetHref(fingerprint: string): string {
  return `${THEME_SHEET_PATH}/${fingerprint}.css`;
}

export function asksForFactoryTheme(search: string): boolean {
  return new URLSearchParams(search).get(SAFE_THEME_PARAM) === SAFE_THEME_VALUE;
}

export function withoutFactoryThemeParam(href: string): string {
  const url = new URL(href);
  url.searchParams.delete(SAFE_THEME_PARAM);
  return `${url.pathname}${url.search}${url.hash}`;
}

function sheetsOf(target: Document, selector: string): HTMLLinkElement[] {
  return Array.from(target.querySelectorAll<HTMLLinkElement>(selector));
}

function swapSheet(target: Document, href: string | null): boolean {
  const settled = sheetsOf(target, SETTLED_SHEET);
  const pending = sheetsOf(target, PENDING_SHEET);
  if (href === null) {
    [...settled, ...pending].forEach((sheet) => sheet.remove());
    return true;
  }
  const isWanted = (sheet: HTMLLinkElement) => sheet.getAttribute("href") === href;
  if ([...settled, ...pending].some(isWanted)) {
    pending.filter((sheet) => !isWanted(sheet)).forEach((sheet) => sheet.remove());
    return settled.some(isWanted);
  }
  pending.forEach((sheet) => sheet.remove());
  const next = target.createElement("link");
  next.rel = "stylesheet";
  next.href = href;
  next.setAttribute(THEME_SHEET_PENDING_ATTRIBUTE, "");
  const settle = () => {
    if (!next.isConnected) return;
    sheetsOf(target, SETTLED_SHEET).forEach((sheet) => sheet.remove());
    next.removeAttribute(THEME_SHEET_PENDING_ATTRIBUTE);
    next.id = THEME_SHEET_ID;
    latestPaint.get(target)?.();
  };
  next.addEventListener("load", settle, { once: true });
  next.addEventListener("error", settle, { once: true });
  target.head.appendChild(next);
  return false;
}

function writeDraft(target: Document, css: string | null): void {
  const current = target.getElementById(THEME_DRAFT_ID);
  if (css === null) {
    current?.remove();
    return;
  }
  const style = current ?? target.createElement("style");
  style.id = THEME_DRAFT_ID;
  style.textContent = css;
  if (current === null) target.head.appendChild(style);
}

export function paintTheme(target: Document, boot: ThemeBoot, draft: string | null): void {
  const paint = () => {
    const root = target.documentElement;
    root.setAttribute(THEME_ATTRIBUTE, boot.theme);
    if (boot.theme === "custom") root.setAttribute(THEME_BASE_ATTRIBUTE, boot.base);
    else root.removeAttribute(THEME_BASE_ATTRIBUTE);
    writeDraft(target, draft);
    sheetsOf(target, SETTLED_SHEET).forEach((sheet) => {
      sheet.disabled = draft !== null;
    });
    target.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };
  latestPaint.set(target, paint);
  const arrived = swapSheet(target, boot.fingerprint === null ? null : sheetHref(boot.fingerprint));
  if (arrived || draft !== null) paint();
}
