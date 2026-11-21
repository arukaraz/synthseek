import { CONTRACT_TOKENS, THEME_CONTRACT } from "@theme/contract";

import { followedColor, formatOklch, parseColor } from "./color";
import { setDeclaration, valuesOf } from "./declarations";
import { draftValues, presetValues, tokenPathOf } from "./draft";
import type { Oklch, ThemeDraft } from "./types";

const DIMMED_FILES = new Set(["content-types", "status"]);
const DIMMED_EXTRAS = new Set([
  "--mix-daily",
  "--mix-weekly",
  "--mix-explore",
  "--mix-cf",
  "--color-primary-400",
  "--color-secondary-400",
  "--color-accent-400",
]);
const DIMMED_LIGHTNESS = 0.5;
const DIMMED_CHROMA_CAP = 0.19;

const LIGHT_COLORS: readonly (readonly [string, Oklch])[] = [
  ["--surface-bg", { l: 1, c: 0, h: 0, alpha: 1 }],
  ["--surface-bg-elevated", { l: 0.98, c: 0, h: 0, alpha: 1 }],
  ["--surface-bg-overlay", { l: 0.965, c: 0, h: 0, alpha: 1 }],
  ["--surface-bg-sunken", { l: 0.96, c: 0, h: 0, alpha: 1 }],
  ["--muted", { l: 0.94, c: 0.01, h: 250, alpha: 1 }],
  ["--border-default", { l: 0.88, c: 0.02, h: 250, alpha: 1 }],
  ["--border-subtle", { l: 0.92, c: 0.01, h: 250, alpha: 1 }],
  ["--glass-bg", { l: 1, c: 0, h: 0, alpha: 0.7 }],
  ["--glass-border", { l: 0, c: 0, h: 0, alpha: 0.1 }],
  ["--hairline", { l: 0, c: 0, h: 0, alpha: 1 }],
  ["--backdrop-grid", { l: 0, c: 0, h: 0, alpha: 0.05 }],
  ["--surface-fg", { l: 0.145, c: 0.05, h: 265, alpha: 1 }],
  ["--surface-fg-muted", { l: 0.51, c: 0.03, h: 250, alpha: 1 }],
  ["--ring", { l: 0.145, c: 0.05, h: 265, alpha: 1 }],
];
const LIGHT_SHADOW_STRENGTH = "0.25";

function writeValue(draft: ThemeDraft, name: string, value: string): ThemeDraft | null {
  const token = CONTRACT_TOKENS.get(name);
  if (!token) return null;
  const path = tokenPathOf(token.file);
  const text = setDeclaration(draft.files[path] ?? "", name, value);
  if (valuesOf(text).get(name) !== value) return null;
  return { ...draft, files: { ...draft.files, [path]: text } };
}

function followerValue(kind: string, before: string, after: string, current: string): string | null {
  if (kind !== "color") return after;
  const baseBefore = parseColor(before);
  const baseAfter = parseColor(after);
  const follower = parseColor(current);
  if (!baseBefore || !baseAfter || !follower) return null;
  return formatOklch(followedColor(baseBefore, baseAfter, follower));
}

function applyValue(draft: ThemeDraft, name: string, value: string): ThemeDraft | null {
  const before = draftValues(draft).get(name) ?? "";
  const written = writeValue(draft, name, value);
  if (!written) return null;
  if (before === value) return written;
  let next = written;
  for (const token of THEME_CONTRACT.tokens) {
    if (token.follows !== name || !next.meta.follows.includes(token.name)) continue;
    const current = draftValues(next).get(token.name);
    if (current === undefined) continue;
    const followed = followerValue(token.kind, before, value, current);
    if (followed === null) continue;
    next = applyValue(next, token.name, followed) ?? next;
  }
  return next;
}

export function setToken(draft: ThemeDraft, name: string, value: string): ThemeDraft {
  const applied = applyValue(draft, name, value.trim());
  if (!applied) return draft;
  return {
    ...applied,
    meta: { ...applied.meta, follows: applied.meta.follows.filter((followed) => followed !== name) },
  };
}

export function resetToken(draft: ThemeDraft, name: string): ThemeDraft {
  const token = CONTRACT_TOKENS.get(name);
  if (!token) return draft;
  const preset = presetValues(draft.meta.startedFrom);
  const presetValue = preset[name] ?? "";
  if (!token.follows) return setToken(draft, name, presetValue);
  const currentBase = draftValues(draft).get(token.follows) ?? "";
  const presetBase = preset[token.follows] ?? "";
  let value = presetValue;
  if (presetBase !== currentBase) {
    if (token.kind === "color") {
      const before = parseColor(presetBase);
      const after = parseColor(currentBase);
      const own = parseColor(presetValue);
      if (before && after && own) value = formatOklch(followedColor(before, after, own));
    } else {
      value = currentBase;
    }
  }
  const applied = applyValue(draft, name, value);
  if (!applied) return draft;
  const follows = applied.meta.follows.includes(name) ? applied.meta.follows : [...applied.meta.follows, name];
  return { ...applied, meta: { ...applied.meta, follows } };
}

export function isTokenChanged(draft: ThemeDraft, name: string): boolean {
  const token = CONTRACT_TOKENS.get(name);
  if (!token) return false;
  if (token.follows) return !draft.meta.follows.includes(name);
  return draftValues(draft).get(name) !== presetValues(draft.meta.startedFrom)[name];
}

function isDimmed(name: string): boolean {
  const token = CONTRACT_TOKENS.get(name);
  return token !== undefined && token.kind === "color" && (DIMMED_FILES.has(token.file) || DIMMED_EXTRAS.has(name));
}

export function lightSet(draft: ThemeDraft): ThemeDraft {
  const original = draftValues(draft);
  const writes: [string, string][] = LIGHT_COLORS.map(([name, color]) => [name, formatOklch(color)]);
  writes.push(["--shadow-strength", LIGHT_SHADOW_STRENGTH]);
  const dimmed: string[] = [];
  for (const token of THEME_CONTRACT.tokens) {
    if (!isDimmed(token.name)) continue;
    const color = parseColor(original.get(token.name) ?? "");
    if (!color) continue;
    dimmed.push(token.name);
    writes.push([token.name, formatOklch({ ...color, l: DIMMED_LIGHTNESS, c: Math.min(color.c, DIMMED_CHROMA_CAP) })]);
  }
  const files = { ...draft.files };
  for (const [name, value] of writes) {
    const token = CONTRACT_TOKENS.get(name);
    if (!token) continue;
    const path = tokenPathOf(token.file);
    files[path] = setDeclaration(files[path] ?? "", name, value);
  }
  return {
    meta: { ...draft.meta, scheme: "light", follows: draft.meta.follows.filter((name) => !dimmed.includes(name)) },
    files,
  };
}
