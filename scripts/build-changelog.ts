#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { renderChangelog } from "./changelog/render";
import { changelogSchema } from "./changelog/schema";

const ROOT = process.cwd();
const SOURCE_PATH = resolve(ROOT, "changelog.json");
const OUTPUT_PATH = resolve(ROOT, "CHANGELOG.md");

function main(): void {
  const raw = readFileSync(SOURCE_PATH, "utf8");
  const parsed = changelogSchema.parse(JSON.parse(raw));
  const markdown = renderChangelog(parsed);
  writeFileSync(OUTPUT_PATH, markdown, "utf8");
  console.log(`changelog:build wrote CHANGELOG.md from changelog.json (${parsed.versions.length} versions)`);
}

main();
