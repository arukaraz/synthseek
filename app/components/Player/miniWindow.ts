"use client";

import {
  MINI_WINDOW_HEIGHT_PX,
  APP_TITLE,
  MINI_WINDOW_WIDTH_PX,
  MIRRORED_ROOT_ATTRIBUTES,
  PLAYER_MODE_ATTRIBUTE,
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

function adoptStyles(target: Window): void {
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const style = target.document.createElement("style");
      style.textContent = Array.from(sheet.cssRules)
        .map((rule) => rule.cssText)
        .join("\n");
      target.document.head.appendChild(style);
    } catch {
      const link = target.document.createElement("link");
      link.rel = "stylesheet";
      if (sheet.href !== null) link.href = sheet.href;
      target.document.head.appendChild(link);
    }
  }
}

function adoptRootAttributes(target: Window): void {
  for (const name of MIRRORED_ROOT_ATTRIBUTES) {
    const value = document.documentElement.getAttribute(name);
    if (value !== null) target.document.documentElement.setAttribute(name, value);
  }
  target.document.documentElement.setAttribute(PLAYER_MODE_ATTRIBUTE, "mini");
  target.document.title = APP_TITLE;
  target.document.body.style.setProperty("margin", "0");
  target.document.body.style.setProperty("overflow", "hidden");
}

export function ensureMiniHeight(px: number): void {
  if (host === null || host.closed || host.innerHeight >= px) return;
  const heightOff = host.outerHeight - host.innerHeight;
  try {
    host.resizeTo(host.outerWidth, px + heightOff);
  } catch {
    return;
  }
}

export async function openMiniWindow(onClosed: () => void): Promise<boolean> {
  const api = window.documentPictureInPicture;
  if (api === undefined) return false;
  try {
    const opened = await api.requestWindow({
      width: MINI_WINDOW_WIDTH_PX,
      height: MINI_WINDOW_HEIGHT_PX,
      disallowReturnToOpener: true,
      preferInitialWindowPlacement: true,
    });
    adoptStyles(opened);
    adoptRootAttributes(opened);
    opened.addEventListener("pagehide", () => {
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
