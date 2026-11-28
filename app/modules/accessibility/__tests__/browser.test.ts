import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ACCESSIBILITY_ATTRIBUTE_NAMES, DEFAULT_ACCESSIBILITY_COOKIE } from "../constants";
import {
  applyAccessibilityAttributes,
  readAccessibilityCookie,
  readMotionReduced,
  readResolvedAccessibility,
  subscribeAccessibility,
  writeGuestAccessibilityCookies,
} from "../browser";
import type { A11yPreference } from "../types";

const device = vi.hoisted(() => ({ motion: false, contrast: false }));
const listeners = vi.hoisted(() => new Set<() => void>());

function clearRoot(): void {
  for (const name of ACCESSIBILITY_ATTRIBUTE_NAMES) document.documentElement.removeAttribute(name);
}

function clearCookies(): void {
  for (const name of ["a11y", "a11y_guest"]) document.cookie = `${name}=; Path=/; Max-Age=0`;
}

beforeEach(() => {
  device.motion = false;
  device.contrast = false;
  listeners.clear();
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("reduced-motion") ? device.motion : device.contrast,
    media: query,
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  }));
  clearRoot();
  clearCookies();
});

afterEach(() => {
  vi.unstubAllGlobals();
  clearRoot();
  clearCookies();
});

describe("the nine motion combinations", () => {
  const choices: Array<A11yPreference | "default"> = ["default", "on", "off"];

  it.each(
    choices.flatMap((choice) =>
      [false, true].map((asks): [A11yPreference | "default", boolean, boolean] => [
        choice,
        asks,
        choice === "on" ? true : choice === "off" ? false : asks,
      ])
    )
  )("attribute %s with the device asking %s reduces motion: %s", (choice, asks, expected) => {
    device.motion = asks;
    if (choice !== "default") document.documentElement.setAttribute("data-a11y-motion", choice);

    expect(readMotionReduced()).toBe(expected);
  });
});

describe("readResolvedAccessibility", () => {
  it("lets transparency follow resolved motion unless it is set", () => {
    device.motion = true;
    expect(readResolvedAccessibility().transparencyReduced).toBe(true);

    document.documentElement.setAttribute("data-a11y-transparency", "off");
    expect(readResolvedAccessibility().transparencyReduced).toBe(false);

    document.documentElement.removeAttribute("data-a11y-transparency");
    document.documentElement.setAttribute("data-a11y-motion", "on");
    device.motion = false;
    expect(readResolvedAccessibility().transparencyReduced).toBe(true);
  });

  it("forces more contrast while the mode is on", () => {
    expect(readResolvedAccessibility().moreContrast).toBe(false);

    document.documentElement.setAttribute("data-a11y-mode", "on");
    document.documentElement.setAttribute("data-a11y-contrast", "off");

    expect(readResolvedAccessibility().moreContrast).toBe(true);
  });

  it("follows the device for contrast at the defaults", () => {
    device.contrast = true;

    expect(readResolvedAccessibility().moreContrast).toBe(true);
  });
});

describe("applyAccessibilityAttributes", () => {
  it("leaves the page bare at the defaults", () => {
    applyAccessibilityAttributes(document.documentElement, DEFAULT_ACCESSIBILITY_COOKIE);

    for (const name of ACCESSIBILITY_ATTRIBUTE_NAMES) expect(document.documentElement.hasAttribute(name)).toBe(false);
  });

  it("removes an attribute when its value returns to the default", () => {
    applyAccessibilityAttributes(document.documentElement, { ...DEFAULT_ACCESSIBILITY_COOKIE, motion: "on" });
    expect(document.documentElement.getAttribute("data-a11y-motion")).toBe("on");

    applyAccessibilityAttributes(document.documentElement, DEFAULT_ACCESSIBILITY_COOKIE);

    expect(document.documentElement.hasAttribute("data-a11y-motion")).toBe(false);
  });
});

describe("the guest cookies", () => {
  it("writes the choice and the guest marker, and reads the choice back", () => {
    const values = { mode: true, motion: "on", transparency: "off", contrast: "auto", buttonNames: true } as const;

    writeGuestAccessibilityCookies(values);

    expect(document.cookie).toContain("a11y=1.1.0.a.1");
    expect(document.cookie).toContain("a11y_guest=1");
    expect(readAccessibilityCookie()).toEqual(values);
  });

  it("reads the defaults when no cookie is set", () => {
    expect(readAccessibilityCookie()).toEqual(DEFAULT_ACCESSIBILITY_COOKIE);
  });
});

describe("subscribeAccessibility", () => {
  it("notifies on an attribute change and on a device change, and stops after unsubscribing", async () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeAccessibility(onChange);

    document.documentElement.setAttribute("data-a11y-motion", "on");
    await Promise.resolve();
    expect(onChange).toHaveBeenCalled();

    onChange.mockClear();
    for (const listener of listeners) listener();
    expect(onChange).toHaveBeenCalled();

    unsubscribe();
    expect(listeners.size).toBe(0);
    onChange.mockClear();
    document.documentElement.setAttribute("data-a11y-motion", "off");
    await Promise.resolve();
    expect(onChange).not.toHaveBeenCalled();
  });
});
