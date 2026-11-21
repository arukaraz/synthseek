// @vitest-environment node
import { CONTRACT_TOKENS, THEME_CONTRACT, THEME_PRESETS } from "@theme/contract";
import { describe, expect, it } from "vitest";

import { formatOklch, parseColor } from "../color";
import { setDeclaration } from "../declarations";
import { draftValues } from "../draft";
import { isTokenChanged, lightSet, resetToken, setToken } from "../follow";
import type { Oklch, ThemeDraft } from "../types";

import { oklch, presetDraft } from "./fixtures";

const PRIMARY = "--color-primary-500";
const PRIMARY_400 = "--color-primary-400";
const PRIMARY_600 = "--color-primary-600";
const ALBUM = "--type-album";

function colorOf(draft: ThemeDraft, name: string): Oklch {
  const color = parseColor(draftValues(draft).get(name) ?? "");
  if (!color) throw new Error(`${name} is not a readable color`);
  return color;
}

function movedPrimary(draft: ThemeDraft): ThemeDraft {
  const color = colorOf(draft, PRIMARY);
  return setToken(draft, PRIMARY, formatOklch({ ...color, l: color.l - 0.1, h: color.h + 30 }));
}

describe("setToken", () => {
  it("writes the value into the token's file", () => {
    const next = setToken(presetDraft(), "--surface-bg", "red");
    expect(draftValues(next).get("--surface-bg")).toBe("red");
    expect(next.files["tokens/surfaces.css"]).toContain("--surface-bg: red;");
  });

  it("trims the value", () => {
    expect(draftValues(setToken(presetDraft(), "--surface-bg", "  red ")).get("--surface-bg")).toBe("red");
  });

  it("returns the draft unchanged for an unknown token", () => {
    const draft = presetDraft();
    expect(setToken(draft, "--not-a-token", "red")).toBe(draft);
  });

  it("returns the draft unchanged for a value that would break the file", () => {
    const draft = presetDraft();
    expect(setToken(draft, PRIMARY, "1; --x: 2")).toBe(draft);
  });

  it("does not mutate the draft it was given", () => {
    const draft = presetDraft();
    const snapshot = JSON.stringify(draft);
    setToken(draft, PRIMARY, "red");
    expect(JSON.stringify(draft)).toBe(snapshot);
  });

  it("takes the token out of follows when it was set by hand", () => {
    const next = setToken(presetDraft(), PRIMARY_400, formatOklch({ l: 0.8, c: 0.1, h: 100, alpha: 1 }));
    expect(next.meta.follows).not.toContain(PRIMARY_400);
    expect(next.meta.follows).toContain(PRIMARY_600);
  });

  it("moves the followers of a base, and the followers of those followers", () => {
    const draft = presetDraft();
    const next = movedPrimary(draft);
    const delta = colorOf(next, PRIMARY).l - colorOf(draft, PRIMARY).l;
    expect(delta).toBeCloseTo(-0.1, 2);
    expect(colorOf(next, PRIMARY_400).l - colorOf(draft, PRIMARY_400).l).toBeCloseTo(delta, 2);
    expect(colorOf(next, PRIMARY_600).l - colorOf(draft, PRIMARY_600).l).toBeCloseTo(delta, 2);
    expect(colorOf(next, ALBUM).l - colorOf(draft, ALBUM).l).toBeCloseTo(delta, 2);
    expect(colorOf(next, "--status-downloading").l - colorOf(draft, "--status-downloading").l).toBeCloseTo(delta, 2);
  });

  it("keeps the lightness gap and shifts the hue of a follower", () => {
    const draft = presetDraft();
    const next = movedPrimary(draft);
    const gapBefore = colorOf(draft, PRIMARY_400).l - colorOf(draft, PRIMARY).l;
    expect(colorOf(next, PRIMARY_400).l - colorOf(next, PRIMARY).l).toBeCloseTo(gapBefore, 2);
    const hueMoved = (colorOf(next, PRIMARY_400).h - colorOf(draft, PRIMARY_400).h + 360) % 360;
    expect(hueMoved).toBeCloseTo(30, 0);
  });

  it("leaves a hand-set step where it is, and what follows that step", () => {
    const handSet = setToken(presetDraft(), PRIMARY_400, formatOklch({ l: 0.8, c: 0.1, h: 100, alpha: 1 }));
    const next = movedPrimary(handSet);
    expect(draftValues(next).get(PRIMARY_400)).toBe(draftValues(handSet).get(PRIMARY_400));
    expect(draftValues(next).get(ALBUM)).toBe(draftValues(handSet).get(ALBUM));
    expect(draftValues(next).get(PRIMARY_600)).not.toBe(draftValues(handSet).get(PRIMARY_600));
  });

  it("leaves a token that does not follow the base", () => {
    const draft = presetDraft();
    const next = movedPrimary(draft);
    expect(draftValues(next).get("--color-secondary-500")).toBe(draftValues(draft).get("--color-secondary-500"));
    expect(draftValues(next).get("--surface-bg")).toBe(draftValues(draft).get("--surface-bg"));
  });

  it("leaves a follower whose color cannot be read, and takes nothing from an unreadable base", () => {
    const withVar = setToken(presetDraft(), PRIMARY_400, "var(--other)");
    const rejoined = { ...withVar, meta: { ...withVar.meta, follows: [...withVar.meta.follows, PRIMARY_400] } };
    expect(draftValues(movedPrimary(rejoined)).get(PRIMARY_400)).toBe("var(--other)");
    const unreadableBase = setToken(presetDraft(), PRIMARY, "var(--other)");
    expect(draftValues(unreadableBase).get(PRIMARY_400)).toBe(draftValues(presetDraft()).get(PRIMARY_400));
  });

  it("does not move followers when the value did not change", () => {
    const draft = presetDraft();
    const same = setToken(draft, PRIMARY, draftValues(draft).get(PRIMARY) ?? "");
    expect(draftValues(same).get(PRIMARY_400)).toBe(draftValues(draft).get(PRIMARY_400));
  });

  it("writes a follower back as it was when the base is set to its own value", () => {
    const draft = presetDraft();
    const odd = oklch("0.7000 0.1000 290.04");
    const seeded = {
      ...draft,
      files: { ...draft.files, "tokens/brand.css": setDeclaration(draft.files["tokens/brand.css"], PRIMARY_400, odd) },
    };
    const next = setToken(seeded, PRIMARY, draftValues(seeded).get(PRIMARY) ?? "");
    expect(draftValues(next).get(PRIMARY_400)).toBe(odd);
  });

  it("gives a font that follows another font the new value as it is", () => {
    const next = setToken(presetDraft(), "--font-sans", "Georgia, serif");
    expect(draftValues(next).get("--font-heading")).toBe("Georgia, serif");
    const handSet = setToken(presetDraft(), "--font-heading", "Courier, monospace");
    expect(draftValues(setToken(handSet, "--font-sans", "Georgia, serif")).get("--font-heading")).toBe(
      "Courier, monospace"
    );
  });
});

describe("resetToken", () => {
  it("puts a hand-set step back into follows", () => {
    const handSet = setToken(presetDraft(), PRIMARY_400, formatOklch({ l: 0.8, c: 0.1, h: 100, alpha: 1 }));
    const reset = resetToken(handSet, PRIMARY_400);
    expect(reset.meta.follows).toContain(PRIMARY_400);
    expect(draftValues(reset).get(PRIMARY_400)).toBe(THEME_PRESETS.dark[PRIMARY_400]);
  });

  it("puts the step back at its offset from the base as the base stands now", () => {
    const moved = movedPrimary(presetDraft());
    const handSet = setToken(moved, PRIMARY_400, formatOklch({ l: 0.8, c: 0.1, h: 100, alpha: 1 }));
    const reset = resetToken(handSet, PRIMARY_400);
    expect(reset.meta.follows).toContain(PRIMARY_400);
    expect(draftValues(reset).get(PRIMARY_400)).toBe(draftValues(moved).get(PRIMARY_400));
  });

  it("moves what follows the step along with it", () => {
    const handSet = setToken(presetDraft(), PRIMARY_400, formatOklch({ l: 0.8, c: 0.1, h: 100, alpha: 1 }));
    const reset = resetToken(handSet, PRIMARY_400);
    expect(colorOf(reset, ALBUM).l).toBeCloseTo(colorOf(presetDraft(), ALBUM).l, 2);
    expect(colorOf(reset, ALBUM).c).toBeCloseTo(colorOf(presetDraft(), ALBUM).c, 2);
    expect(colorOf(handSet, ALBUM).l).not.toBeCloseTo(colorOf(presetDraft(), ALBUM).l, 2);
  });

  it("puts a token with no base back to the preset value", () => {
    const changed = setToken(presetDraft("midnight"), "--surface-bg", "red");
    const reset = resetToken(changed, "--surface-bg");
    expect(draftValues(reset).get("--surface-bg")).toBe(THEME_PRESETS.midnight["--surface-bg"]);
    expect(isTokenChanged(reset, "--surface-bg")).toBe(false);
  });

  it("resets a base and lets its followers move back with it", () => {
    const moved = movedPrimary(presetDraft());
    const reset = resetToken(moved, PRIMARY);
    expect(draftValues(reset).get(PRIMARY)).toBe(THEME_PRESETS.dark[PRIMARY]);
    expect(colorOf(reset, PRIMARY_400).l).toBeCloseTo(colorOf(presetDraft(), PRIMARY_400).l, 2);
  });

  it("gives a follower an unreadable preset value as it is", () => {
    const handSet = setToken(presetDraft(), "--font-heading", "Courier, monospace");
    const reset = resetToken(handSet, "--font-heading");
    expect(reset.meta.follows).toContain("--font-heading");
    expect(draftValues(reset).get("--font-heading")).toBe(THEME_PRESETS.dark["--font-heading"]);
  });

  it("returns the draft unchanged for an unknown token", () => {
    const draft = presetDraft();
    expect(resetToken(draft, "--nope")).toBe(draft);
  });
});

describe("isTokenChanged", () => {
  it("is false for every token of an untouched draft", () => {
    const draft = presetDraft();
    expect(THEME_CONTRACT.tokens.filter((token) => isTokenChanged(draft, token.name))).toEqual([]);
  });

  it("is true for a token set to another value", () => {
    expect(isTokenChanged(setToken(presetDraft(), "--surface-bg", "red"), "--surface-bg")).toBe(true);
  });

  it("is true for a follower once it left follows, and false when it joined again", () => {
    const handSet = setToken(presetDraft(), PRIMARY_400, formatOklch({ l: 0.8, c: 0.1, h: 100, alpha: 1 }));
    expect(isTokenChanged(handSet, PRIMARY_400)).toBe(true);
    expect(isTokenChanged(resetToken(handSet, PRIMARY_400), PRIMARY_400)).toBe(false);
  });

  it("is false for a follower that moved with its base", () => {
    expect(isTokenChanged(movedPrimary(presetDraft()), PRIMARY_400)).toBe(false);
  });

  it("is false for an unknown token", () => {
    expect(isTokenChanged(presetDraft(), "--nope")).toBe(false);
  });
});

describe("lightSet", () => {
  const draft = presetDraft();
  const light = lightSet(draft);

  it("sets the scheme and leaves the original draft alone", () => {
    expect(light.meta.scheme).toBe("light");
    expect(draft.meta.scheme).toBe("dark");
  });

  it("writes the light surfaces, text and shadow", () => {
    const values = draftValues(light);
    expect(values.get("--surface-bg")).toBe(formatOklch({ l: 1, c: 0, h: 0, alpha: 1 }));
    expect(values.get("--surface-bg-sunken")).toBe(formatOklch({ l: 0.96, c: 0, h: 0, alpha: 1 }));
    expect(values.get("--muted")).toBe(formatOklch({ l: 0.94, c: 0.01, h: 250, alpha: 1 }));
    expect(values.get("--glass-bg")).toBe(formatOklch({ l: 1, c: 0, h: 0, alpha: 0.7 }));
    expect(values.get("--backdrop-grid")).toBe(formatOklch({ l: 0, c: 0, h: 0, alpha: 0.05 }));
    expect(values.get("--surface-fg")).toBe(formatOklch({ l: 0.145, c: 0.05, h: 265, alpha: 1 }));
    expect(values.get("--ring")).toBe(formatOklch({ l: 0.145, c: 0.05, h: 265, alpha: 1 }));
    expect(values.get("--shadow-strength")).toBe("0.25");
  });

  it("keeps the brand colors", () => {
    for (const name of [PRIMARY, "--color-secondary-500", "--color-accent-500", PRIMARY_600]) {
      expect(draftValues(light).get(name), name).toBe(draftValues(draft).get(name));
    }
  });

  it("dims the content type, status, mix and brand 400 colors to 0.5 with a capped chroma", () => {
    const dimmed = THEME_CONTRACT.tokens.filter(
      (token) =>
        token.kind === "color" &&
        (token.file === "content-types" ||
          token.file === "status" ||
          token.name.startsWith("--mix-") ||
          ["--color-primary-400", "--color-secondary-400", "--color-accent-400"].includes(token.name))
    );
    expect(dimmed.length).toBeGreaterThan(20);
    for (const token of dimmed) {
      const before = colorOf(draft, token.name);
      const after = colorOf(light, token.name);
      expect(after.l, token.name).toBeCloseTo(0.5, 3);
      expect(after.c, token.name).toBeCloseTo(Math.min(before.c, 0.19), 3);
      expect(after.h, token.name).toBeCloseTo(before.h, 1);
      expect(after.alpha, token.name).toBeCloseTo(before.alpha, 2);
    }
  });

  it("takes the dimmed tokens out of follows and keeps the others", () => {
    expect(light.meta.follows).not.toContain(PRIMARY_400);
    expect(light.meta.follows).not.toContain(ALBUM);
    expect(light.meta.follows).not.toContain("--success-soft");
    expect(light.meta.follows).toContain(PRIMARY_600);
    expect(light.meta.follows).toContain("--neon-accent");
    for (const name of light.meta.follows) expect(CONTRACT_TOKENS.has(name)).toBe(true);
  });

  it("changes only token files", () => {
    const changed = Object.keys(light.files).filter((path) => light.files[path] !== draft.files[path]);
    expect(changed.sort()).toEqual(
      [
        "tokens/brand.css",
        "tokens/content-types.css",
        "tokens/elevation.css",
        "tokens/status.css",
        "tokens/surfaces.css",
        "tokens/text.css",
        "tokens/widgets.css",
      ].sort()
    );
  });

  it("does not move a follower along with its dimmed base", () => {
    expect(colorOf(light, "--status-failed").l).toBeCloseTo(0.5, 3);
    expect(draftValues(light).get(PRIMARY_600)).toBe(draftValues(draft).get(PRIMARY_600));
  });
});
