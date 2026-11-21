// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

import { describe, expect, it } from "vitest";

const APP_ROOT = resolve(process.cwd(), "app");
const SELF = "theme/__tests__/token-gate.test.ts";
const SKIPPED_DIRECTORIES = new Set(["node_modules", "__generated__"]);

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const COLOR_UTILITY =
  "text|bg|border|border-[trblxyse]|ring|ring-offset|from|via|to|fill|stroke|shadow|outline|decoration|divide|placeholder|caret|accent|inset-shadow|inset-ring|drop-shadow|text-shadow";

interface GateRule {
  id: string;
  pattern: RegExp;
  sample: string;
  extensions: readonly string[];
  allowed: readonly string[];
}

const CODE = [".ts", ".tsx"];
const CODE_AND_STYLES = [".ts", ".tsx", ".css"];
const TOKEN_SOURCES = [
  "theme/tokens/brand.css",
  "theme/tokens/surfaces.css",
  "theme/tokens/text.css",
  "theme/tokens/content-types.css",
  "theme/tokens/status.css",
  "theme/tokens/widgets.css",
  "theme/tokens/elevation.css",
  "theme/tokens/services.css",
  "theme/tokens/internal.css",
  "theme/themes/midnight.css",
  "theme/themes/ocean.css",
];

const RULES: readonly GateRule[] = [
  {
    id: "palette class",
    pattern: new RegExp(`(?<![\\w-])(?:${COLOR_UTILITY})-(?:${PALETTE})-(?:50|[1-9]00|950)\\b`),
    sample: "hover:text-red-400",
    extensions: CODE_AND_STYLES,
    allowed: [],
  },
  {
    id: "black or white class",
    pattern: new RegExp(`(?<![\\w-])(?:${COLOR_UTILITY})-(?:black|white)\\b`),
    sample: "bg-black/40",
    extensions: CODE_AND_STYLES,
    allowed: [],
  },
  {
    id: "palette variable",
    pattern: new RegExp(`var\\(--color-(?:${PALETTE}|black|white)\\b`),
    sample: "shadow-[0_0_8px_var(--color-cyan-400)]",
    extensions: CODE_AND_STYLES,
    allowed: [],
  },
  {
    id: "literal color function",
    pattern: /(?:rgba?|hsla?|oklab|oklch|lab|lch|hwb)\(\s*[\d.]/,
    sample: "rgba(255, 255, 255, 0.05)",
    extensions: CODE_AND_STYLES,
    allowed: ["components/Player/helpers.ts", ...TOKEN_SOURCES],
  },
  {
    id: "hex color",
    pattern: /(?<![\w&/-])#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b(?![\w-])/,
    sample: 'stroke="#062014"',
    extensions: CODE_AND_STYLES,
    allowed: [],
  },
  {
    id: "text size in pixels",
    pattern: /(?<![\w-])text-\[[\d.]+px\]/,
    sample: "text-[11px]",
    extensions: CODE,
    allowed: [],
  },
  {
    id: "arbitrary letter spacing",
    pattern: /(?<![\w-])tracking-\[/,
    sample: "tracking-[0.14em]",
    extensions: CODE,
    allowed: [],
  },
  {
    id: "hand-written font family",
    pattern: /(?<![\w-])font-\[(?!\d)[^\]]+\]|fontFamily\s*:/,
    sample: "font-['Inter']",
    extensions: CODE,
    allowed: [],
  },
  {
    id: "logo font outside the logo",
    pattern: /font-courgette/,
    sample: "font-courgette",
    extensions: CODE_AND_STYLES,
    allowed: ["components/ui/AppLogo/AppLogo.tsx", "theme/base/typography.css", "theme/fonts.ts"],
  },
];

function sourceFiles(directory: string, found: string[] = []): string[] {
  for (const name of readdirSync(directory)) {
    if (SKIPPED_DIRECTORIES.has(name)) continue;
    const full = join(directory, name);
    if (statSync(full).isDirectory()) sourceFiles(full, found);
    else if (CODE_AND_STYLES.some((extension) => name.endsWith(extension)) && !name.endsWith(".d.ts")) found.push(full);
  }
  return found;
}

function violationsOf(rule: GateRule, files: readonly string[]): string[] {
  const found: string[] = [];
  for (const file of files) {
    const path = relative(APP_ROOT, file).split(sep).join("/");
    if (path === SELF || rule.allowed.includes(path)) continue;
    if (!rule.extensions.some((extension) => path.endsWith(extension))) continue;
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, index) => {
        if (rule.pattern.test(line)) found.push(`${path}:${index + 1}: ${line.trim().slice(0, 140)}`);
      });
  }
  return found;
}

describe("the theme token gate", () => {
  const files = sourceFiles(APP_ROOT);

  it("reads a tree large enough to be the app", () => {
    expect(files.length).toBeGreaterThan(1000);
  });

  it.each(RULES)("recognises a $id when one is written", (rule) => {
    expect(rule.pattern.test(rule.sample)).toBe(true);
  });

  it.each(RULES)("finds no $id outside the contract", (rule) => {
    expect(violationsOf(rule, files)).toEqual([]);
  });
});
