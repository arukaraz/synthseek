#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.argv[2] ?? new URL("..", import.meta.url).pathname;
const NUMBERS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

const COUNTED = new RegExp(
  `\\b(${Object.keys(NUMBERS).join("|")})\\s+` +
    `(cases|ways|places|reasons|sources|themes|figures|kinds|things|steps|roles|conditions|checks)\\b` +
    `[^:.]*:\\s*([^\\n]+?)(?=\\.\\s+[A-Z]|\\.$|\\n|$)`,
  "gi",
);

const ABSOLUTE = /\b(never|always|only|all|every|any|no)\b/gi;
const HEDGED = /\b(where|unless|except|until|while|if|when)\b/i;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist" || entry === ".astro") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(mdx|md|astro)$/.test(entry)) out.push(full);
  }
  return out;
}

function itemsIn(list) {
  const trimmed = list.replace(/\.$/, "").trim();
  if (!/,\s*and\s/.test(trimmed)) return null;
  return trimmed.split(/,\s*(?:and\s+)?/).filter((part) => part.trim().length > 0).length;
}

const files = walk(ROOT);
const miscounts = [];
const absolutes = [];

for (const file of files) {
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");

  for (const match of text.matchAll(COUNTED)) {
    const claimed = NUMBERS[match[1].toLowerCase()];
    const found = itemsIn(match[3]);
    if (found === null || found === claimed) continue;
    const line = text.slice(0, match.index).split("\n").length;
    miscounts.push({ file, line, claimed, found, noun: match[2], text: match[0].slice(0, 110) });
  }

  lines.forEach((line, index) => {
    if (line.startsWith("|") || line.startsWith("#") || line.trim().startsWith("import ")) return;
    for (const match of line.matchAll(ABSOLUTE)) {
      const sentence = line.slice(Math.max(0, match.index - 90), match.index + 110);
      if (HEDGED.test(sentence)) continue;
      absolutes.push({ file, line: index + 1, word: match[0], sentence: sentence.trim() });
    }
  });
}

for (const m of miscounts) {
  console.log(`FAIL ${relative(process.cwd(), m.file)}:${m.line}`);
  console.log(`     says "${m.claimed} ${m.noun}" but the list has ${m.found}`);
  console.log(`     ${m.text}`);
}

console.log(
  `\n${files.length} public pages scanned, ${miscounts.length} miscounted enumeration(s), ` +
    `${absolutes.length} unhedged absolute(s).`,
);

if (process.argv.includes("--list-absolutes")) {
  for (const a of absolutes) {
    console.log(`  ${relative(process.cwd(), a.file)}:${a.line}  "${a.word}"  ${a.sentence.slice(0, 100)}`);
  }
}

process.exit(miscounts.length > 0 ? 1 : 0);
