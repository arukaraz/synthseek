// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";
import { z } from "zod";

import { SUPPORTED_LOCALES } from "../../modules/i18n/config";
import { CONTRACT_TOKENS, THEME_CONTRACT, THEME_PRESETS, THEME_PRESET_IDS } from "../contract";

const APP_ROOT = resolve(process.cwd(), "app");
const THEME_ROOT = join(APP_ROOT, "theme");
const PART_ATTRIBUTE = 'data-part="';
const SKIPPED_DIRECTORIES = new Set(["node_modules", "__generated__", "__tests__"]);
const UTILITY_NAMESPACES = ["--font-", "--tracking-"];

function filesUnder(directory: string, extensions: readonly string[], found: string[] = []): string[] {
  for (const name of readdirSync(directory)) {
    if (SKIPPED_DIRECTORIES.has(name)) continue;
    const full = join(directory, name);
    if (statSync(full).isDirectory()) filesUnder(full, extensions, found);
    else if (extensions.some((extension) => name.endsWith(extension))) found.push(full);
  }
  return found;
}

function readsOf(token: string): string[] {
  const asVariable = [`(${token})`, `(${token},`];
  return UTILITY_NAMESPACES.some((namespace) => token.startsWith(namespace))
    ? [...asVariable, token.slice(2)]
    : asVariable;
}

const ThemeCopySchema = z.object({
  sections: z.record(z.string(), z.string().min(1)),
  tokens: z.record(z.string(), z.object({ label: z.string().min(1), hint: z.string() })),
  parts: z.record(z.string(), z.string().min(1)),
});

function themeCopyOf(locale: string): z.infer<typeof ThemeCopySchema> {
  const file = join(APP_ROOT, "modules", "i18n", "messages", locale, "theme.json");
  return ThemeCopySchema.parse(JSON.parse(readFileSync(file, "utf8")));
}

function partNamesIn(source: string): string[] {
  const names: string[] = [];
  let from = source.indexOf(PART_ATTRIBUTE);
  while (from !== -1) {
    const start = from + PART_ATTRIBUTE.length;
    names.push(source.slice(start, source.indexOf('"', start)));
    from = source.indexOf(PART_ATTRIBUTE, start);
  }
  return names;
}

describe("the theme contract", () => {
  const tokenSources = new Set(THEME_CONTRACT.files.map((file) => join(THEME_ROOT, file.path)));
  const presetSources = new Set(
    THEME_CONTRACT.presets.flatMap((preset) => (preset.path === undefined ? [] : [join(THEME_ROOT, preset.path)]))
  );

  it("places every token in a file it lists, following and painted on tokens it lists", () => {
    const fileIds = new Set(THEME_CONTRACT.files.map((file) => file.id));
    const broken = THEME_CONTRACT.tokens.filter(
      (token) =>
        !fileIds.has(token.file) ||
        (token.follows !== undefined && !CONTRACT_TOKENS.has(token.follows)) ||
        (token.on !== undefined && !CONTRACT_TOKENS.has(token.on))
    );
    expect(broken.map((token) => token.name)).toEqual([]);
  });

  it("names no token twice", () => {
    expect(CONTRACT_TOKENS.size).toBe(THEME_CONTRACT.tokens.length);
  });

  it("gives every token a value in every preset", () => {
    const missing = THEME_PRESET_IDS.flatMap((preset) =>
      THEME_CONTRACT.tokens
        .filter((token) => !THEME_PRESETS[preset]?.[token.name])
        .map((token) => `${preset} ${token.name}`)
    );
    expect(missing).toEqual([]);
  });

  it("declares every token in the factory file the contract places it in", () => {
    const undeclared = THEME_CONTRACT.files.flatMap((file) => {
      const css = readFileSync(join(THEME_ROOT, file.path), "utf8");
      return THEME_CONTRACT.tokens
        .filter((token) => token.file === file.id && !css.includes(`${token.name}:`))
        .map((token) => token.name);
    });
    expect(undeclared).toEqual([]);
  });

  it("carries in each preset the value its own file sets", () => {
    const stale = THEME_CONTRACT.presets.flatMap((preset) => {
      if (preset.path === undefined) return [];
      const css = readFileSync(join(THEME_ROOT, preset.path), "utf8");
      return THEME_CONTRACT.tokens
        .filter((token) => css.includes(`${token.name}:`))
        .filter((token) => !css.includes(`${token.name}: ${THEME_PRESETS[preset.id]?.[token.name]};`))
        .map((token) => `${preset.id} ${token.name}`);
    });
    expect(stale).toEqual([]);
  });

  it("lists no token the app never reads", () => {
    const readers = filesUnder(APP_ROOT, [".ts", ".tsx", ".css"])
      .filter((file) => !tokenSources.has(file) && !presetSources.has(file))
      .map((file) => readFileSync(file, "utf8"));
    const unread = THEME_CONTRACT.tokens
      .filter((token) => !readers.some((source) => readsOf(token.name).some((reading) => source.includes(reading))))
      .map((token) => token.name);
    expect(unread).toEqual([]);
  });

  it("counts a variable, a variable with a fallback and a named utility as a reading", () => {
    expect(readsOf("--glow")).toEqual(["(--glow)", "(--glow,"]);
    expect(readsOf("--tracking-wide")).toEqual(["(--tracking-wide)", "(--tracking-wide,", "tracking-wide"]);
  });

  it("puts every part it promises on an element, and no element carries a part it does not list", () => {
    const placed = new Set(filesUnder(APP_ROOT, [".tsx"]).flatMap((file) => partNamesIn(readFileSync(file, "utf8"))));
    const promised = new Set(THEME_CONTRACT.parts.map((part) => part.name));
    expect([...promised].filter((name) => !placed.has(name))).toEqual([]);
    expect([...placed].filter((name) => !promised.has(name))).toEqual([]);
  });

  it("reads a part name where one is written", () => {
    expect(partNamesIn('<nav data-part="sidebar"><b data-part="button" /></nav>')).toEqual(["sidebar", "button"]);
  });

  it.each(SUPPORTED_LOCALES)("names every file, token and part in %s, and nothing the contract left", (locale) => {
    const copy = themeCopyOf(locale);

    expect(Object.keys(copy.sections).sort()).toEqual(THEME_CONTRACT.files.map((file) => file.id).sort());
    expect(Object.keys(copy.tokens).sort()).toEqual(THEME_CONTRACT.tokens.map((token) => token.name).sort());
    expect(Object.keys(copy.parts).sort()).toEqual(THEME_CONTRACT.parts.map((part) => part.name).sort());
  });
});
