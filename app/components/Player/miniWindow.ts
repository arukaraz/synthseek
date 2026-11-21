"use client";

import { THEME_CHANGE_EVENT, THEME_DRAFT_ID, THEME_SHEET_ID } from "@theme/ThemeProvider/constants";

import {
  MINI_THEME_STYLE_ATTRIBUTE,
  MINI_WINDOW_HEIGHT_PX,
  APP_TITLE,
  MINI_WINDOW_WIDTH_PX,
  MIRRORED_ROOT_ATTRIBUTES,
  PLAYER_MODE_ATTRIBUTE,
  ROOT_FONT_BASE_PX,
} from "./constants";

let host: Window | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function miniPlayerSupported(): boolean {
  return typeof window !== "undefined" && window.documentPictureInPicture !== undefined;
}

export function subscribeMiniWindow(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function miniWindowBody(): HTMLElement | null {
  return host === null || host.closed ? null : host.document.body;
}

function isThemeSheet(sheet: CSSStyleSheet): boolean {
  const owner = sheet.ownerNode;
  return owner instanceof Element && (owner.id === THEME_SHEET_ID || owner.id === THEME_DRAFT_ID);
}

function adoptSheet(target: Window, sheet: CSSStyleSheet): void {
  const mark = (node: Element) => {
    if (isThemeSheet(sheet)) node.setAttribute(MINI_THEME_STYLE_ATTRIBUTE, "");
    target.document.head.appendChild(node);
  };
  try {
    const style = target.document.createElement("style");
    style.textContent = Array.from(sheet.cssRules)
      .map((rule) => rule.cssText)
      .join("\n");
    mark(style);
  } catch {
    const link = target.document.createElement("link");
    link.rel = "stylesheet";
    if (sheet.href !== null) link.href = sheet.href;
    mark(link);
  }
}

function adoptStyles(target: Window): void {
  for (const sheet of Array.from(document.styleSheets)) {
    if (!sheet.disabled) adoptSheet(target, sheet);
  }
}

function adoptRootAttributes(target: Window): void {
  for (const name of MIRRORED_ROOT_ATTRIBUTES) {
    const value = document.documentElement.getAttribute(name);
    if (value === null) target.document.documentElement.removeAttribute(name);
    else target.document.documentElement.setAttribute(name, value);
  }
  target.document.documentElement.setAttribute(PLAYER_MODE_ATTRIBUTE, "mini");
  target.document.title = APP_TITLE;
  target.document.body.style.setProperty("margin", "0");
  target.document.body.style.setProperty("overflow", "hidden");
}

function followTheme(target: Window): void {
  target.document.head.querySelectorAll(`[${MINI_THEME_STYLE_ATTRIBUTE}]`).forEach((node) => node.remove());
  for (const sheet of Array.from(document.styleSheets)) {
    if (!sheet.disabled && isThemeSheet(sheet)) adoptSheet(target, sheet);
  }
  adoptRootAttributes(target);
}

function rootScale(): number {
  const size = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(size) && size > 0 ? size / ROOT_FONT_BASE_PX : 1;
}

export function ensureMiniHeight(px: number): void {
  const wanted = Math.round(px * rootScale());
  if (host === null || host.closed || host.innerHeight >= wanted) return;
  const heightOff = host.outerHeight - host.innerHeight;
  try {
    host.resizeTo(host.outerWidth, wanted + heightOff);
  } catch {
    return;
  }
}

export async function openMiniWindow(onClosed: () => void): Promise<boolean> {
  const api = window.documentPictureInPicture;
  if (api === undefined) return false;
  try {
    const scale = rootScale();
    const opened = await api.requestWindow({
      width: Math.round(MINI_WINDOW_WIDTH_PX * scale),
      height: Math.round(MINI_WINDOW_HEIGHT_PX * scale),
      disallowReturnToOpener: true,
      preferInitialWindowPlacement: true,
    });
    adoptStyles(opened);
    adoptRootAttributes(opened);
    const follow = () => followTheme(opened);
    document.addEventListener(THEME_CHANGE_EVENT, follow);
    opened.addEventListener("pagehide", () => {
      document.removeEventListener(THEME_CHANGE_EVENT, follow);
      host = null;
      notify();
      onClosed();
    });
    host = opened;
    notify();
    return true;
  } catch {
    return false;
  }
}

export function closeMiniWindow(): void {
  if (host === null || host.closed) {
    host = null;
    return;
  }
  const closing = host;
  host = null;
  notify();
  closing.close();
}
