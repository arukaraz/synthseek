import { describe, expect, it } from "vitest";

import { DEFAULT_ACCESSIBILITY_COOKIE } from "../constants";
import {
  accessibilityAttributesOf,
  motionConfigOf,
  parseAccessibilityCookie,
  resolveMoreContrast,
  resolveMotionReduced,
  resolveTransparencyReduced,
  sameAccessibilityCookie,
  serializeAccessibilityCookie,
  shortcutAllowed,
} from "../helpers";
import type { A11yPreference, AccessibilityCookie } from "../types";

const PREFERENCES: A11yPreference[] = ["auto", "on", "off"];

describe("parseAccessibilityCookie", () => {
  it("reads the default fixture", () => {
    expect(parseAccessibilityCookie("0.a.a.a.0")).toEqual({
      mode: false,
      motion: "auto",
      transparency: "auto",
      contrast: "auto",
      buttonNames: false,
    });
  });

  it("reads a fully set fixture", () => {
    expect(parseAccessibilityCookie("1.1.0.a.1")).toEqual({
      mode: true,
      motion: "on",
      transparency: "off",
      contrast: "auto",
      buttonNames: true,
    });
  });

  it("falls back to the defaults for an absent value", () => {
    expect(parseAccessibilityCookie(undefined)).toEqual(DEFAULT_ACCESSIBILITY_COOKIE);
    expect(parseAccessibilityCookie(null)).toEqual(DEFAULT_ACCESSIBILITY_COOKIE);
  });

  it.each(["", "garbage", "1.1.0.a", "1.1.0.a.1.1", "2.a.a.a.0", "0.x.a.a.0", "0.a.a.a.a", "1.1.0.a.2"])(
    "falls back to the defaults for the malformed value %j",
    (value) => {
      expect(parseAccessibilityCookie(value)).toEqual(DEFAULT_ACCESSIBILITY_COOKIE);
    }
  );
});

describe("serializeAccessibilityCookie", () => {
  it("writes the literal fixtures", () => {
    expect(serializeAccessibilityCookie(DEFAULT_ACCESSIBILITY_COOKIE)).toBe("0.a.a.a.0");
    expect(
      serializeAccessibilityCookie({
        mode: true,
        motion: "on",
        transparency: "off",
        contrast: "auto",
        buttonNames: true,
      })
    ).toBe("1.1.0.a.1");
  });

  it("round trips every combination of the five fields", () => {
    for (const mode of [true, false]) {
      for (const motion of PREFERENCES) {
        for (const transparency of PREFERENCES) {
          for (const contrast of PREFERENCES) {
            for (const buttonNames of [true, false]) {
              const values: AccessibilityCookie = { mode, motion, transparency, contrast, buttonNames };
              expect(parseAccessibilityCookie(serializeAccessibilityCookie(values))).toEqual(values);
            }
          }
        }
      }
    }
  });
});

describe("sameAccessibilityCookie", () => {
  it("tells equal values from different ones", () => {
    expect(sameAccessibilityCookie(DEFAULT_ACCESSIBILITY_COOKIE, { ...DEFAULT_ACCESSIBILITY_COOKIE })).toBe(true);
    expect(sameAccessibilityCookie(DEFAULT_ACCESSIBILITY_COOKIE, { ...DEFAULT_ACCESSIBILITY_COOKIE, mode: true })).toBe(
      false
    );
  });
});

describe("accessibilityAttributesOf", () => {
  it("emits nothing at the defaults", () => {
    expect(accessibilityAttributesOf(DEFAULT_ACCESSIBILITY_COOKIE)).toEqual({});
  });

  it("emits only the non-default values", () => {
    expect(accessibilityAttributesOf(parseAccessibilityCookie("1.1.0.a.1"))).toEqual({
      "data-a11y-mode": "on",
      "data-a11y-motion": "on",
      "data-a11y-transparency": "off",
      "data-a11y-names": "on",
    });
    expect(accessibilityAttributesOf({ ...DEFAULT_ACCESSIBILITY_COOKIE, contrast: "off" })).toEqual({
      "data-a11y-contrast": "off",
    });
  });
});

describe("resolveMotionReduced", () => {
  const cases: Array<[A11yPreference, boolean, boolean]> = [
    ["auto", false, false],
    ["auto", true, true],
    ["on", false, true],
    ["on", true, true],
    ["off", false, false],
    ["off", true, false],
  ];

  it.each(cases)("choice %s with the device asking %s resolves to %s", (choice, device, expected) => {
    expect(resolveMotionReduced(choice, device)).toBe(expected);
  });

  it("maps each choice to the motion library setting", () => {
    expect(PREFERENCES.map(motionConfigOf)).toEqual(["user", "always", "never"]);
  });
});

describe("resolveTransparencyReduced", () => {
  it.each<[A11yPreference, boolean, boolean]>([
    ["auto", false, false],
    ["auto", true, true],
    ["on", false, true],
    ["off", true, false],
  ])("choice %s with motion reduced %s resolves to %s", (choice, motion, expected) => {
    expect(resolveTransparencyReduced(choice, motion)).toBe(expected);
  });
});

describe("resolveMoreContrast", () => {
  it.each<[A11yPreference, boolean, boolean, boolean]>([
    ["auto", false, false, false],
    ["auto", false, true, true],
    ["on", false, false, true],
    ["off", false, true, false],
    ["off", true, false, true],
    ["auto", true, false, true],
  ])("choice %s, mode %s, device %s resolves to %s", (choice, mode, device, expected) => {
    expect(resolveMoreContrast(choice, mode, device)).toBe(expected);
  });
});

describe("shortcutAllowed", () => {
  const letter = { key: "j", ctrlKey: false, metaKey: false, altKey: false };

  it("lets a single character through only while the switch is on", () => {
    expect(shortcutAllowed(letter, true)).toBe(true);
    expect(shortcutAllowed(letter, false)).toBe(false);
    expect(shortcutAllowed({ ...letter, key: " " }, false)).toBe(false);
    expect(shortcutAllowed({ ...letter, key: "/" }, false)).toBe(false);
  });

  it("always lets modified and named keys through", () => {
    expect(shortcutAllowed({ ...letter, ctrlKey: true }, false)).toBe(true);
    expect(shortcutAllowed({ ...letter, metaKey: true }, false)).toBe(true);
    expect(shortcutAllowed({ ...letter, altKey: true }, false)).toBe(true);
    expect(shortcutAllowed({ ...letter, key: "Escape" }, false)).toBe(true);
    expect(shortcutAllowed({ ...letter, key: "ArrowLeft" }, false)).toBe(true);
  });
});
