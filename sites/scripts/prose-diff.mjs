#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SITES = fileURLToPath(new URL("..", import.meta.url));
const WEB = join(SITES, "..");
const SITE_NAMES = ["docs", "landing"];
const DEPENDENCY_FOLDERS = ["node_modules", "shared/node_modules", "docs/node_modules", "landing/node_modules"];
const SKIPPED_FOLDERS = new Set(["_astro", "pagefind"]);
const CACHE_ENTRIES = new Set([".astro", ".vite", ".cache"]);

const MAIN = /<main\b[^>]*>([\s\S]*?)<\/main>/i;
const BODY = /<body\b[^>]*>([\s\S]*?)<\/body>/i;
const TITLE = /<title>([\s\S]*?)<\/title>/i;
const INVISIBLE = /<(script|style|svg|template|noscript)\b[\s\S]*?<\/\1>/gi;
const BLOCK_BOUNDARY =
  /<\/?(?:address|article|aside|blockquote|br|button|dd|details|div|dl|dt|figcaption|figure|footer|h[1-6]|header|hr|label|li|main|nav|ol|option|p|pre|section|summary|table|td|th|tr|ul)\b[^>]*>/gi;
const TAG = /<[^>]+>/g;
const NUMERIC_ENTITY = /&#(x?)([0-9a-f]+);/gi;
const NAMED_ENTITY = /&(amp|lt|gt|quot|apos|nbsp);/g;
const WHITESPACE = /\s+/g;
const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decode(text) {
  return text
    .replace(NUMERIC_ENTITY, (_match, hex, digits) => String.fromCodePoint(parseInt(digits, hex ? 16 : 10)))
    .replace(NAMED_ENTITY, (_match, name) => NAMED[name]);
}

function visibleBlocks(html) {
  const title = TITLE.exec(html)?.[1];
  const scoped = MAIN.exec(html)?.[1] ?? BODY.exec(html)?.[1] ?? html;
  const blocks = scoped
    .replace(INVISIBLE, " ")
    .replace(BLOCK_BOUNDARY, "\n")
    .replace(TAG, "")
    .split("\n")
    .map((line) => decode(line).replace(WHITESPACE, " ").trim())
    .filter((line) => line !== "");
  return title === undefined ? blocks : [`Title: ${decode(title).trim()}`, ...blocks];
}

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return SKIPPED_FOLDERS.has(entry.name) ? [] : htmlFiles(join(dir, entry.name));
    return entry.name.endsWith(".html") ? [join(dir, entry.name)] : [];
  });
}

function pagesOf(sitesRoot) {
  const pages = new Map();
  for (const site of SITE_NAMES) {
    const dist = join(sitesRoot, site, "dist");
    for (const file of htmlFiles(dist)) {
      const path = relative(dist, file)
        .split(sep)
        .join("/")
        .replace(/(^|\/)index\.html$/, "$1");
      pages.set(`${site} /${path}`, visibleBlocks(readFileSync(file, "utf8")));
    }
  }
  return pages;
}

function build(sitesRoot) {
  execFileSync("npm", ["run", "build"], { cwd: sitesRoot, stdio: ["ignore", "ignore", "inherit"] });
}

function hunks(before, after) {
  const lengths = Array.from({ length: before.length + 1 }, () => new Array(after.length + 1).fill(0));
  for (let i = before.length - 1; i >= 0; i--) {
    for (let j = after.length - 1; j >= 0; j--) {
      lengths[i][j] =
        before[i] === after[j] ? lengths[i + 1][j + 1] + 1 : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }

  const result = [];
  let current = { removed: [], added: [] };
  const flush = () => {
    if (current.removed.length > 0 || current.added.length > 0) result.push(current);
    current = { removed: [], added: [] };
  };
  let i = 0;
  let j = 0;
  while (i < before.length || j < after.length) {
    if (i < before.length && j < after.length && before[i] === after[j]) {
      flush();
      i++;
      j++;
    } else if (j < after.length && (i === before.length || lengths[i][j + 1] >= lengths[i + 1][j])) {
      current.added.push(after[j++]);
    } else {
      current.removed.push(before[i++]);
    }
  }
  flush();
  return result;
}

function quoted(blocks) {
  return blocks.map((block) => `> ${block}`).join("\n>\n");
}

function hunkReport({ removed, added }) {
  if (removed.length === 0) return `**New:**\n\n${quoted(added)}`;
  if (added.length === 0) return `**Removed:**\n\n${quoted(removed)}`;
  return `**Before:**\n\n${quoted(removed)}\n\n**Now:**\n\n${quoted(added)}`;
}

function report(before, after) {
  const sections = [];
  const names = [...new Set([...before.keys(), ...after.keys()])].sort();
  for (const name of names) {
    const old = before.get(name);
    const now = after.get(name);
    if (old === undefined) sections.push(`## ${name} (new page)\n\n${quoted(now)}`);
    else if (now === undefined) sections.push(`## ${name} (page removed)\n\n${quoted(old)}`);
    else {
      const changes = hunks(old, now);
      if (changes.length > 0) sections.push(`## ${name}\n\n${changes.map(hunkReport).join("\n\n")}`);
    }
  }
  return sections.length === 0 ? "No reader-visible text changed on either site.\n" : `${sections.join("\n\n")}\n`;
}

function workspacePathOf(resolved) {
  const inside = relative(SITES, resolved);
  if (inside === "" || inside.startsWith("..") || inside.split(sep).includes("node_modules")) return null;
  return inside;
}

function linkEntry(source, target, sitesRoot) {
  const stats = lstatSync(source);
  if (!stats.isSymbolicLink()) {
    symlinkSync(source, target, stats.isDirectory() ? "dir" : "file");
    return;
  }
  if (!existsSync(source)) {
    process.stderr.write(`Skipping ${source}: its link points at nothing\n`);
    return;
  }
  const resolved = realpathSync(source);
  const workspace = workspacePathOf(resolved);
  symlinkSync(workspace === null ? resolved : join(sitesRoot, workspace), target, "dir");
}

function linkFolder(source, target, sitesRoot) {
  mkdirSync(target, { recursive: true });
  for (const name of readdirSync(source)) {
    if (CACHE_ENTRIES.has(name)) continue;
    const from = join(source, name);
    const to = join(target, name);
    if (name.startsWith("@") && lstatSync(from).isDirectory()) linkFolder(from, to, sitesRoot);
    else linkEntry(from, to, sitesRoot);
  }
}

function linkDependencies(sitesRoot) {
  for (const folder of DEPENDENCY_FOLDERS) {
    const source = join(SITES, folder);
    const target = join(sitesRoot, folder);
    if (existsSync(source) && !existsSync(target)) linkFolder(source, target, sitesRoot);
  }
}

function pagesAt(ref) {
  const scratch = mkdtempSync(join(tmpdir(), "sites-prose-diff-"));
  const checkout = join(scratch, "web");
  execFileSync("git", ["-C", WEB, "worktree", "add", "--detach", checkout, ref], { stdio: "ignore" });
  try {
    const sitesRoot = join(checkout, "sites");
    linkDependencies(sitesRoot);
    build(sitesRoot);
    return pagesOf(sitesRoot);
  } finally {
    execFileSync("git", ["-C", WEB, "worktree", "remove", "--force", checkout], { stdio: "ignore" });
    rmSync(scratch, { recursive: true, force: true });
  }
}

const ref = process.argv[2];
if (ref === undefined) {
  process.stderr.write("Usage: node scripts/prose-diff.mjs <web-ref-of-the-last-release>\n");
  process.exit(2);
}

for (const [signal, code] of [
  ["SIGINT", 130],
  ["SIGTERM", 143],
]) {
  process.on(signal, () => process.exit(code));
}
execFileSync("git", ["-C", WEB, "worktree", "prune"], { stdio: "ignore" });

const before = pagesAt(ref);
build(SITES);
process.stdout.write(report(before, pagesOf(SITES)));
