import {
  CONTRAST_MINIMUM,
  CONTRAST_UNREADABLE,
  contrastRatio,
  draftValues,
  isTokenChanged,
  parseColor,
  presetValues,
} from "@theme/custom";
import type { ThemeDraft } from "@theme/custom";
import type { ContractToken } from "@theme/contract";
import { matchesTerms, searchTerms } from "@utils/search";

import {
  COURIER_STACK,
  FACTORY_PRESET,
  FONT_MONO,
  FONT_SANS,
  GEOMETRIC_STACK,
  HUMANIST_STACK,
  MONOSPACE_STACK,
  ROUNDED_STACK,
  SERIF_STACK,
  TEXT_SECTION,
} from "./constants";
import type { FontChoice, FontLabelKey, FontPreset, RangeToken, TokenCopy, UnreadablePair, UnsavedKind } from "./types";

const NUMBER_CHARACTERS = "0123456789.-+";

export function copyOf(copy: Record<string, TokenCopy>, name: string): TokenCopy {
  return Object.hasOwn(copy, name) ? copy[name] : { label: name, hint: "" };
}

export function essentialsOf(tokens: readonly ContractToken[]): readonly ContractToken[] {
  const essentials = tokens.filter((token) => token.essential === true);
  return essentials.length > 0 ? essentials : tokens;
}

export function matchesQuery(token: ContractToken, copy: TokenCopy, query: string): boolean {
  return matchesTerms(searchTerms(query), [copy.label, copy.hint, token.name]);
}

export function changedNamesOf(draft: ThemeDraft, tokens: readonly ContractToken[]): Set<string> {
  const changed = new Set<string>();
  for (const token of tokens) {
    if (isTokenChanged(draft, token.name)) changed.add(token.name);
  }
  return changed;
}

function unsavedKindsOf(
  draft: ThemeDraft,
  saved: ThemeDraft,
  tokens: readonly ContractToken[]
): Map<string, UnsavedKind> {
  const now = draftValues(draft);
  const before = draftValues(saved);
  const kinds = new Map<string, UnsavedKind>();
  for (const token of tokens) {
    const follows = draft.meta.follows.includes(token.name);
    const refollowed = follows !== saved.meta.follows.includes(token.name);
    const moved = now.get(token.name) !== before.get(token.name);
    if (refollowed || (moved && !follows)) kinds.set(token.name, "own");
    else if (moved) kinds.set(token.name, "derived");
  }
  return kinds;
}

export function unsavedNamesOf(draft: ThemeDraft, saved: ThemeDraft, tokens: readonly ContractToken[]): Set<string> {
  const unsaved = new Set<string>();
  for (const [name, kind] of unsavedKindsOf(draft, saved, tokens)) {
    if (kind === "own") unsaved.add(name);
  }
  return unsaved;
}

export function dirtySectionsOf(draft: ThemeDraft, saved: ThemeDraft, tokens: readonly ContractToken[]): Set<string> {
  const kinds = unsavedKindsOf(draft, saved, tokens);
  const dirty = new Set<string>();
  for (const token of tokens) {
    if (kinds.has(token.name)) dirty.add(token.file);
  }
  return dirty;
}

export function contrastOf(value: string, other: string | null): number | null {
  if (other === null) return null;
  const color = parseColor(value);
  const against = parseColor(other);
  if (color === null || against === null) return null;
  return contrastRatio(color, against);
}

export function isLowContrast(ratio: number): boolean {
  return ratio < CONTRAST_MINIMUM;
}

export function unreadableOn(
  values: ReadonlyMap<string, string>,
  tokens: readonly ContractToken[]
): Map<string, UnreadablePair> {
  const pairs = new Map<string, UnreadablePair>();
  for (const token of tokens) {
    if (token.file !== TEXT_SECTION || token.on === undefined) continue;
    const ratio = contrastOf(values.get(token.name) ?? "", values.get(token.on) ?? null);
    if (ratio === null || ratio >= CONTRAST_UNREADABLE) continue;
    const worst = pairs.get(token.on);
    if (worst === undefined || ratio < worst.ratio) pairs.set(token.on, { text: token.name, ratio });
  }
  return pairs;
}

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(1)}:1`;
}

export function unitOf(token: RangeToken): string {
  return token.kind === "length" ? token.unit : "";
}

function isPlainNumberText(text: string): boolean {
  return text !== "" && [...text].every((char) => NUMBER_CHARACTERS.includes(char)) && Number.isFinite(Number(text));
}

export function plainNumber(value: string, unit: string): number | null {
  const text = value.trim();
  if (unit === "") return isPlainNumberText(text) ? Number(text) : null;
  if (text === "0") return 0;
  if (!text.endsWith(unit)) return null;
  const body = text.slice(0, -unit.length);
  return isPlainNumberText(body) ? Number(body) : null;
}

export function percentOf(alpha: number): number {
  return Math.round(alpha * 100);
}

function fontPresetsOf(tokenName: string): FontPreset[] {
  const factory = presetValues(FACTORY_PRESET);
  if (tokenName === FONT_MONO) {
    return [
      { key: "systemMono", stack: factory[FONT_MONO] },
      { key: "courier", stack: COURIER_STACK },
      { key: "sameAsInterface", stack: factory[FONT_SANS] },
    ];
  }
  return [
    { key: "system", stack: factory[tokenName] },
    { key: "humanist", stack: HUMANIST_STACK },
    { key: "geometric", stack: GEOMETRIC_STACK },
    { key: "rounded", stack: ROUNDED_STACK },
    { key: "serif", stack: SERIF_STACK },
    { key: "monospace", stack: MONOSPACE_STACK },
  ];
}

export function fontStackOf(tokenName: string, family: string): string {
  return `"${family}", ${presetValues(FACTORY_PRESET)[tokenName]}`;
}

export function fontChoicesOf(
  tokenName: string,
  families: readonly string[],
  labelOf: (key: FontLabelKey) => string
): FontChoice[] {
  const presets = fontPresetsOf(tokenName).map((preset) => ({ value: preset.stack, label: labelOf(preset.key) }));
  const uploaded = families.map((family) => ({ value: fontStackOf(tokenName, family), label: family }));
  return [...presets, ...uploaded];
}
