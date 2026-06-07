#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import prettier from "prettier";

import { renderChangelog } from "./changelog/render";
import { changelogSchema } from "./changelog/schema";

const ROOT = process.cwd();
const SOURCE_PATH = resolve(ROOT, "changelog.json");
const OUTPUT_PATH = resolve(ROOT, "CHANGELOG.md");

async function main(): Promise<void> {
  const raw = readFileSync(SOURCE_PATH, "utf8");
  const parsed = changelogSchema.parse(JSON.parse(raw));
  const markdown = renderChangelog(parsed);
  const prettierConfig = await prettier.resolveConfig(OUTPUT_PATH);
  const formatted = await prettier.format(markdown, { ...prettierConfig, parser: "markdown" });
  writeFileSync(OUTPUT_PATH, formatted, "utf8");
  console.log(`changelog:build wrote CHANGELOG.md from changelog.json (${parsed.versions.length} versions)`);
}

main();
