import { afterEach, describe, expect, it } from "vitest";

import { THEME_ICON_TYPE } from "../constants";
import { applyThemeIcon, drawThemeIcon } from "../favicon";

const DRAWN = "data:image/png;base64,AAAA";

function link(rel: string, href: string): HTMLLinkElement {
  const element = document.createElement("link");
  element.rel = rel;
  element.setAttribute("href", href);
  element.setAttribute("type", "image/svg+xml");
  document.head.appendChild(element);
  return element;
}

afterEach(() => {
  document.head.innerHTML = "";
  document.documentElement.removeAttribute("style");
});

describe("applyThemeIcon", () => {
  it("points every icon link at the drawn icon and leaves other links alone", () => {
    const icon = link("icon", "/icon.svg");
    const shortcut = link("shortcut icon", "/icon.svg");
    const touch = link("apple-touch-icon", "/apple.png");
    const sheet = link("stylesheet", "/a.css");
    applyThemeIcon(document, () => DRAWN);
    expect(icon.getAttribute("href")).toBe(DRAWN);
    expect(icon.getAttribute("type")).toBe(THEME_ICON_TYPE);
    expect(shortcut.getAttribute("href")).toBe(DRAWN);
    expect(touch.getAttribute("href")).toBe("/apple.png");
    expect(sheet.getAttribute("href")).toBe("/a.css");
  });

  it("keeps the static icon when the icon cannot be drawn", () => {
    const icon = link("icon", "/icon.svg");
    applyThemeIcon(document, () => null);
    expect(icon.getAttribute("href")).toBe("/icon.svg");
    expect(icon.getAttribute("type")).toBe("image/svg+xml");
  });
});

describe("drawThemeIcon", () => {
  it("draws nothing while the brand tokens are not defined", () => {
    expect(drawThemeIcon(document)).toBeNull();
  });

  it("draws nothing rather than throw where a canvas is not available", () => {
    document.documentElement.style.setProperty("--color-secondary-500", "red");
    document.documentElement.style.setProperty("--color-accent-500", "blue");
    expect(drawThemeIcon(document)).toBeNull();
  });
});
