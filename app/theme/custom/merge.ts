import { THEME_CONTRACT } from "@theme/contract";

import { setDeclaration, valuesOf } from "./declarations";
import { draftValues, tokenPathOf } from "./draft";
import type { MergedTokens, ThemeDraft } from "./types";

type TokenWrite = readonly [name: string, value: string];

function tokenWrites(from: string, to: string): Map<string, string> | null {
  const before = valuesOf(from);
  const after = valuesOf(to);
  for (const name of before.keys()) {
    if (!after.has(name)) return null;
  }
  const writes = new Map<string, string>();
  let replayed = from;
  for (const [name, value] of after) {
    if (before.get(name) === value) continue;
    writes.set(name, value);
    replayed = setDeclaration(replayed, name, value);
  }
  return replayed === to ? writes : null;
}

function written(text: string, writes: Iterable<TokenWrite>): string | null {
  let next = text;
  for (const [name, value] of writes) {
    next = setDeclaration(next, name, value);
    if (valuesOf(next).get(name) !== value) return null;
  }
  return next;
}

export function mergeTokenFile(before: string, after: string, own: string): MergedTokens | null {
  const theirs = tokenWrites(before, after);
  if (theirs === null) return null;
  const base = valuesOf(before);
  const mine = valuesOf(own);
  const taken: TokenWrite[] = [];
  let clash = false;
  for (const [name, value] of theirs) {
    const kept = mine.get(name);
    if (kept === base.get(name)) taken.push([name, value]);
    else if (kept !== value) clash = true;
  }
  const text = written(own, taken);
  return text === null ? null : { text, clash };
}

function discardedTokens(before: ThemeDraft, saved: ThemeDraft, path: string): Set<string> {
  const was = draftValues(before);
  const target = draftValues(saved);
  const following = new Set(before.meta.follows);
  const discarded = new Set<string>();
  for (const token of THEME_CONTRACT.tokens) {
    if (tokenPathOf(token.file) === path && was.get(token.name) !== target.get(token.name)) discarded.add(token.name);
  }
  let grew = discarded.size > 0;
  while (grew) {
    grew = false;
    for (const token of THEME_CONTRACT.tokens) {
      if (discarded.has(token.name) || token.follows === undefined || !discarded.has(token.follows)) continue;
      if (!following.has(token.name) || was.get(token.name) === target.get(token.name)) continue;
      discarded.add(token.name);
      grew = true;
    }
  }
  return discarded;
}

function withoutWrites(text: string, savedText: string | undefined, back: readonly TokenWrite[]): string {
  const names = new Set(back.map(([name]) => name));
  const mine = savedText === undefined ? null : tokenWrites(savedText, text);
  if (savedText !== undefined && mine !== null) {
    const kept = [...mine].filter(([name]) => !names.has(name));
    const replayed = written(savedText, kept);
    if (replayed !== null) return replayed;
  }
  return written(text, back) ?? text;
}

export function withoutDiscarded(before: ThemeDraft, loaded: ThemeDraft, saved: ThemeDraft, path: string): ThemeDraft {
  const discarded = discardedTokens(before, saved, path);
  const target = draftValues(saved);
  const files = { ...loaded.files };
  const settled = new Set<string>();
  for (const file of THEME_CONTRACT.files) {
    const tokens = THEME_CONTRACT.tokens.filter((token) => token.file === file.id);
    const filePath = tokenPathOf(file.id);
    if (filePath === path) {
      for (const token of tokens) settled.add(token.name);
      continue;
    }
    const back: TokenWrite[] = [];
    for (const token of tokens) {
      const value = target.get(token.name);
      if (discarded.has(token.name) && value !== undefined) back.push([token.name, value]);
    }
    if (back.length === 0 || !Object.hasOwn(files, filePath)) continue;
    files[filePath] = withoutWrites(files[filePath], saved.files[filePath], back);
    for (const [name] of back) settled.add(name);
  }
  const savedFollows = new Set(saved.meta.follows);
  const mine = new Set(loaded.meta.follows);
  const follows = [
    ...loaded.meta.follows.filter((name) => !settled.has(name) || savedFollows.has(name)),
    ...saved.meta.follows.filter((name) => settled.has(name) && !mine.has(name)),
  ];
  return { meta: { ...loaded.meta, follows }, files };
}
