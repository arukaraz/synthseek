// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

import { describe, expect, it } from "vitest";

const APP_ROOT = resolve(process.cwd(), "app");
const SKIPPED_DIRECTORIES = new Set(["node_modules", "__generated__", "__tests__"]);
const EXTENSIONS = [".ts", ".tsx", ".css"];

const ALLOWED = [
  "modules/accessibility/constants.ts",
  "modules/accessibility/index.ts",
  "modules/accessibility/browser.ts",
  "theme/index.css",
  "features/settings/sections/ThemeSection/components/CssMode/constants.ts",
];

const DEVICE_MOTION = /useReducedMotion|prefers-reduced-motion|REDUCED_MOTION_QUERY/;

function sourceFiles(directory: string, found: string[] = []): string[] {
  for (const name of readdirSync(directory)) {
    if (SKIPPED_DIRECTORIES.has(name)) continue;
    const full = join(directory, name);
    if (statSync(full).isDirectory()) sourceFiles(full, found);
    else if (EXTENSIONS.some((extension) => name.endsWith(extension)) && !name.endsWith(".d.ts")) found.push(full);
  }
  return found;
}

function violations(files: readonly string[]): string[] {
  const found: string[] = [];
  for (const file of files) {
    const path = relative(APP_ROOT, file).split(sep).join("/");
    if (ALLOWED.includes(path)) continue;
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, index) => {
        if (DEVICE_MOTION.test(line)) found.push(`${path}:${index + 1}: ${line.trim().slice(0, 140)}`);
      });
  }
  return found;
}

describe("the motion gate", () => {
  const files = sourceFiles(APP_ROOT);

  it("reads a tree large enough to be the app", () => {
    expect(files.length).toBeGreaterThan(1000);
  });

  it.each([
    "const reduced = useReducedMotion();",
    "@media (prefers-reduced-motion: reduce) {",
    "matchMedia(REDUCED_MOTION_QUERY)",
  ])("recognises %s when it is written", (sample) => {
    expect(DEVICE_MOTION.test(sample)).toBe(true);
  });

  it("asks the device about motion only inside the accessibility module and the theme variants", () => {
    expect(violations(files)).toEqual([]);
  });
});
