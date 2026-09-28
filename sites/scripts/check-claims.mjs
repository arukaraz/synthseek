#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.argv.slice(2).find((arg) => !arg.startsWith("--")) ?? new URL("..", import.meta.url).pathname;
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

const HEADING = /^#{1,6}\s+(.*)$/;
const LIST_MARKER = /^\s*(?:[-*+]|\d+\.)\s+/;
const NOT_PROSE = /^\s*(?:\||<|\{|:::|import\s)/;
const LINK = /\[([^\]]+)\]\([^)]+\)/g;
const EMPHASIS = /[*`]/g;
const SENTENCE_END = /(?<=[.!?])\s+(?=["'(A-Z0-9])/;
const WORD_BREAK = /\s+/;
const PROSE_FILE = /\.mdx?$/;
const AVERAGE_LIMIT = 20;
const SENTENCE_LIMIT = 30;

function sentenceLengths(block) {
  const text = block.replace(LINK, "$1").replace(EMPHASIS, "").trim();
  if (text.length === 0) return [];
  return text
    .split(SENTENCE_END)
    .map((sentence) => sentence.split(WORD_BREAK).filter((word) => word.length > 0).length)
    .filter((count) => count > 0);
}

function sectionsIn(file, lines) {
  const sections = [];
  let current = { file, line: 1, title: "(top)", lengths: [] };
  let block = [];
  let inFence = false;
  let start = 0;

  const flush = () => {
    current.lengths.push(...sentenceLengths(block.join(" ")));
    block = [];
  };

  if (lines[0] === "---") {
    const end = lines.indexOf("---", 1);
    start = end === -1 ? 0 : end + 1;
  }

  for (let index = start; index < lines.length; index++) {
    const line = lines[index];
    if (line.trim().startsWith("```")) {
      flush();
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const heading = line.match(HEADING);
    if (heading) {
      flush();
      if (current.lengths.length > 0) sections.push(current);
      current = { file, line: index + 1, title: heading[1].trim(), lengths: [] };
      continue;
    }
    if (line.trim().length === 0 || NOT_PROSE.test(line)) {
      flush();
      continue;
    }
    if (LIST_MARKER.test(line)) {
      flush();
      block.push(line.replace(LIST_MARKER, ""));
      continue;
    }
    block.push(line.trim());
  }
  flush();
  if (current.lengths.length > 0) sections.push(current);
  return sections;
}

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
const sections = [];

for (const file of files) {
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");

  if (PROSE_FILE.test(file)) sections.push(...sectionsIn(file, lines));

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

const measured = sections.map((section) => {
  const total = section.lengths.reduce((sum, count) => sum + count, 0);
  const average = total / section.lengths.length;
  const overLimit = section.lengths.filter((count) => count > SENTENCE_LIMIT).length;
  return { ...section, average, overLimit, longest: Math.max(...section.lengths) };
});
const tooLong = measured.filter((section) => section.average >= AVERAGE_LIMIT || section.overLimit > 0);

console.log(
  `\n${files.length} public pages scanned, ${miscounts.length} miscounted enumeration(s), ` +
    `${absolutes.length} unhedged absolute(s), ${tooLong.length} section(s) over the sentence-length limits.`,
);

if (process.argv.includes("--list-absolutes")) {
  for (const a of absolutes) {
    console.log(`  ${relative(process.cwd(), a.file)}:${a.line}  "${a.word}"  ${a.sentence.slice(0, 100)}`);
  }
}

if (process.argv.includes("--sentence-lengths")) {
  for (const s of measured) {
    const flag = tooLong.includes(s) ? "OVER" : "    ";
    const over = s.overLimit > 0 ? `, ${s.overLimit} over ${SENTENCE_LIMIT}` : "";
    console.log(
      `  ${flag} ${relative(process.cwd(), s.file)}:${s.line} [${s.title}] ` +
        `${s.lengths.length} sentences, ${s.average.toFixed(1)} words on average, longest ${s.longest}${over}`,
    );
  }
}

process.exit(miscounts.length > 0 ? 1 : 0);
