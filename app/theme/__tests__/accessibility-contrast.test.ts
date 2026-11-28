// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { THEME_CONTRACT, THEME_PRESETS, THEME_PRESET_IDS } from "../contract";
import { contrastRatio as editorContrastRatio } from "../custom";
import { contrastRatio as measuredContrastRatio, formatOklch, fromHex, parseColor, toHex } from "../custom/color";
import type { Oklch } from "../custom/types";
import defaultColors from "./default-colors.json";
import { GLASS_SURFACES } from "./glass-surfaces";

const APP_ROOT = resolve(process.cwd(), "app");
const CSS = readFileSync(join(APP_ROOT, "theme", "utilities", "accessibility.css"), "utf8");
const LUMINANCE_WEIGHT = "0.7152";
const LUMINANCE_HOME = join("theme", "custom", "color.ts");
const MORE_CONTRAST_BLOCK = "@variant more-contrast";
const MORE_CONTRAST_BORDERS = ["--border-default"];

const TEXT_BAR = 4.5;
const NON_TEXT_BAR = 3;
const NON_TEXT_TOKENS = new Set(["--ring"]);
const SURFACES = ["--surface-bg", "--surface-bg-elevated", "--surface-bg-overlay", "--surface-bg-sunken", "--muted"];
const ALPHA_STEPS = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
const READING_ROLE = "--surface-fg-muted";

function contrastRatio(a: Oklch, b: Oklch): number {
  return Math.floor(measuredContrastRatio(a, b) * 100) / 100;
}

function mixOklab(front: Oklch, back: Oklch, share: number): Oklch {
  const lab = (color: Oklch): number[] => {
    const radians = (color.h * Math.PI) / 180;
    return [color.l, color.c * Math.cos(radians), color.c * Math.sin(radians)];
  };
  const [l, a, b] = lab(front).map((value, index) => value * share + lab(back)[index] * (1 - share));
  return { l, c: Math.hypot(a, b), h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360, alpha: 1 };
}

function moreContrastShare(token: string): number {
  const block = CSS.slice(CSS.indexOf(MORE_CONTRAST_BLOCK));
  const key = `${token}: color-mix(in oklab, var(--surface-fg) `;
  const at = block.indexOf(key);
  if (at === -1) throw new Error(`${token} is not mixed from the foreground under more contrast`);
  return Number.parseFloat(block.slice(at + key.length)) / 100;
}

function appSources(): string[] {
  return readdirSync(APP_ROOT, { recursive: true, encoding: "utf8" })
    .filter(
      (path) =>
        (path.endsWith(".ts") || path.endsWith(".tsx")) &&
        !path.includes("__tests__") &&
        !path.includes("__generated__")
    )
    .map((path) => join(APP_ROOT, path));
}

function colorOf(values: Record<string, string>, token: string): Oklch {
  const color = parseColor(values[token] ?? "");
  if (color === null) throw new Error(`${token} does not parse`);
  return color;
}

function channels(hex: string): number[] {
  return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
}

function composite(foreground: Oklch, background: Oklch, alpha: number): Oklch {
  const front = channels(toHex(foreground));
  const back = channels(toHex(background));
  const mixed = front.map((value, index) => Math.round(value * alpha + back[index] * (1 - alpha)));
  const color = fromHex(`#${mixed.map((value) => value.toString(16).padStart(2, "0")).join("")}`);
  if (color === null) throw new Error("composite does not parse");
  return color;
}

function solidSteps(): number[] {
  const steps = new Set<number>();
  for (const match of CSS.matchAll(/\[class~="text-fg\/(\d+)"\]/g)) steps.add(Number(match[1]));
  return [...steps].sort((a, b) => a - b);
}

function withoutBlocks(source: string, opening: string): string {
  let rest = source;
  let from = rest.indexOf(opening);
  while (from !== -1) {
    let depth = 0;
    let end = from;
    for (let index = rest.indexOf("{", from); index < rest.length; index += 1) {
      if (rest[index] === "{") depth += 1;
      if (rest[index] === "}") depth -= 1;
      if (depth === 0) {
        end = index + 1;
        break;
      }
    }
    rest = rest.slice(0, from) + rest.slice(end);
    from = rest.indexOf(opening);
  }
  return rest;
}

describe.each(THEME_PRESET_IDS)("the %s preset under the accessibility mode", (preset) => {
  const values = THEME_PRESETS[preset];

  it.each(THEME_CONTRACT.tokens.filter((token) => token.kind === "color" && token.on !== undefined))(
    "$name reads on its surface at the bar of its kind",
    (token) => {
      const bar = NON_TEXT_TOKENS.has(token.name) ? NON_TEXT_BAR : TEXT_BAR;
      const ratio = contrastRatio(colorOf(values, token.name), colorOf(values, token.on ?? "--surface-bg"));
      expect(ratio).toBeGreaterThanOrEqual(bar);
    }
  );

  it.each(SURFACES)("the solid reading role holds 4.5:1 on %s", (surface) => {
    expect(contrastRatio(colorOf(values, READING_ROLE), colorOf(values, surface))).toBeGreaterThanOrEqual(TEXT_BAR);
  });

  it.each(ALPHA_STEPS)("text at %i percent either clears 4.5:1 on every surface or is made solid", (step) => {
    const clears = SURFACES.every(
      (surface) =>
        contrastRatio(
          composite(colorOf(values, "--surface-fg"), colorOf(values, surface), step / 100),
          colorOf(values, surface)
        ) >= TEXT_BAR
    );
    expect(clears || solidSteps().includes(step)).toBe(true);
  });
});

describe.each(THEME_PRESET_IDS)("the %s preset on a glass surface", (preset) => {
  const values = THEME_PRESETS[preset];

  it.each(GLASS_SURFACES)("flattens $token against each background it is declared over", (surface) => {
    const glass = colorOf(values, surface.token);
    expect(glass.alpha).toBeLessThan(1);
    for (const behind of surface.behind) {
      const flat = composite(glass, colorOf(values, behind), glass.alpha);
      for (const text of surface.text) {
        expect(
          contrastRatio(colorOf(values, text), flat),
          `${text} on ${surface.token} over ${behind}`
        ).toBeGreaterThanOrEqual(TEXT_BAR);
      }
    }
  });
});

describe.each(THEME_PRESET_IDS)("the %s preset under more contrast", (preset) => {
  const values = THEME_PRESETS[preset];

  it.each(MORE_CONTRAST_BORDERS)("%s holds 3:1 on every surface it can sit on", (border) => {
    const share = moreContrastShare(border);
    const foreground = colorOf(values, "--surface-fg");
    for (const surface of SURFACES) {
      const surfaceColor = colorOf(values, surface);
      expect(
        contrastRatio(mixOklab(foreground, surfaceColor, share), surfaceColor),
        `${border} on ${surface}`
      ).toBeGreaterThanOrEqual(NON_TEXT_BAR);
    }
  });

  it("turns faint text into the solid reading role, which holds 4.5:1 on every glass surface", () => {
    for (const surface of GLASS_SURFACES) {
      const glass = colorOf(values, surface.token);
      for (const behind of surface.behind) {
        const flat = composite(glass, colorOf(values, behind), glass.alpha);
        expect(
          contrastRatio(colorOf(values, READING_ROLE), flat),
          `${READING_ROLE} over ${behind}`
        ).toBeGreaterThanOrEqual(TEXT_BAR);
      }
    }
  });
});

describe("the contrast function", () => {
  it("is the one the Custom theme editor reads", () => {
    expect(editorContrastRatio).toBe(measuredContrastRatio);
  });

  it("is the only place the app weighs luminance", () => {
    const homes = appSources()
      .filter((file) => readFileSync(file, "utf8").includes(LUMINANCE_WEIGHT))
      .map((file) => relative(APP_ROOT, file));
    expect(homes).toEqual([LUMINANCE_HOME]);
  });

  it("rounds down, so a ratio just under a bar never reads as meeting it", () => {
    const white: Oklch = { l: 1, c: 0, h: 0, alpha: 1 };
    const grey: Oklch = { l: 0.6, c: 0, h: 0, alpha: 1 };
    const raw = measuredContrastRatio(white, grey);
    expect(contrastRatio(white, grey)).toBeLessThan(raw);
    expect(raw - contrastRatio(white, grey)).toBeLessThan(0.01);
  });
});

describe("the solid steps", () => {
  it("never reach a step that already reads", () => {
    for (const step of solidSteps()) {
      const readsEverywhere = THEME_PRESET_IDS.every((preset) =>
        SURFACES.every(
          (surface) =>
            contrastRatio(
              composite(
                colorOf(THEME_PRESETS[preset], "--surface-fg"),
                colorOf(THEME_PRESETS[preset], surface),
                step / 100
              ),
              colorOf(THEME_PRESETS[preset], surface)
            ) >= TEXT_BAR
        )
      );
      expect(readsEverywhere).toBe(false);
    }
  });
});

describe("the default resolution of the tokens the mode reads", () => {
  const PINNED: Record<string, Record<string, [number, number, number]>> = {
    dark: {
      "--surface-fg": [0.985, 0.015, 250],
      "--surface-fg-muted": [0.7, 0.03, 250],
      "--surface-bg": [0.145, 0.05, 265],
    },
    midnight: {
      "--surface-fg": [0.92, 0.02, 280],
      "--surface-fg-muted": [0.65, 0.02, 280],
      "--surface-bg": [0.08, 0.03, 280],
    },
  };

  it.each(Object.keys(PINNED))("%s keeps its own values", (preset) => {
    for (const [token, [l, c, h]] of Object.entries(PINNED[preset])) {
      expect(THEME_PRESETS[preset as keyof typeof THEME_PRESETS][token]).toBe(formatOklch({ l, c, h, alpha: 1 }));
    }
  });

  it.each(THEME_PRESET_IDS)("the %s preset ships every colour token it shipped before", (preset) => {
    const shipped = Object.fromEntries(
      THEME_CONTRACT.tokens
        .filter((token) => token.kind === "color")
        .map((token) => [token.name, THEME_PRESETS[preset][token.name]])
    );
    expect(shipped).toEqual(defaultColors[preset]);
  });

  it("changes no colour and no border outside the mode and the device's request", () => {
    const outside = withoutBlocks(withoutBlocks(CSS, "@variant more-contrast"), "@media (forced-colors");
    expect(outside).not.toContain("--border-default");
    expect(outside).not.toContain("--border-subtle");
    expect(outside).not.toContain("--glass-border");
    expect(outside).not.toContain("var(--surface-fg-muted)");
  });

  it("no longer carries the block that named a contrast value the platform never reports", () => {
    expect(CSS).not.toContain("prefers-contrast: high");
  });
});
