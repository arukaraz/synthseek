import type { Text } from "@codemirror/state";

import { THEME_CONTRACT } from "@theme/contract";
import { COMPONENTS_DIRECTORY, CUSTOM_FILE, isFreePath, parseColor, tokenPathOf } from "@theme/custom";
import type { ThemeDraft } from "@theme/custom";

import type { ThemeDiagnostic } from "../../types";
import { NEW_FILE_SUFFIX, SNIPPETS, THEME_JSON_PATH, THEME_ROOT, TYPOGRAPHY_FILE_ID } from "./constants";
import type {
  DocumentRange,
  FileStatus,
  FileTreeModel,
  InsertItem,
  InsertQuery,
  Insertion,
  NewFileProblem,
  TextChange,
  ThemeCopy,
  TokenCopy,
  TreeFile,
} from "./types";

function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high);
}

function fileName(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1);
}

export function rootLabelOf(folder: string): string {
  return `${THEME_ROOT}${folder}/`;
}

export function firstTokenPath(): string {
  const first = THEME_CONTRACT.files.at(0);
  return first === undefined ? THEME_JSON_PATH : tokenPathOf(first.id);
}

export function resolveOpenFile(file: string, draft: ThemeDraft): string {
  if (file === THEME_JSON_PATH || Object.hasOwn(draft.files, file)) return file;
  return firstTokenPath();
}

function treeFile(path: string, draft: ThemeDraft, saved: ThemeDraft, broken: readonly string[]): TreeFile {
  return {
    path,
    label: fileName(path),
    dirty: !Object.hasOwn(saved.files, path) || saved.files[path] !== draft.files[path],
    broken: broken.includes(path),
  };
}

export function treeOf(draft: ThemeDraft, saved: ThemeDraft, broken: readonly string[]): FileTreeModel {
  const entry = (path: string) => treeFile(path, draft, saved, broken);
  return {
    tokens: THEME_CONTRACT.files
      .map((file) => tokenPathOf(file.id))
      .filter((path) => Object.hasOwn(draft.files, path))
      .map(entry),
    components: Object.keys(draft.files)
      .filter((path) => isFreePath(path) && path !== CUSTOM_FILE)
      .sort()
      .map(entry),
    custom: Object.hasOwn(draft.files, CUSTOM_FILE) ? entry(CUSTOM_FILE) : null,
  };
}

export function allPaths(model: FileTreeModel): string[] {
  return [
    THEME_JSON_PATH,
    ...model.tokens.map((file) => file.path),
    ...model.components.map((file) => file.path),
    ...(model.custom === null ? [] : [model.custom.path]),
  ];
}

export function fileStatusOf(diagnostics: readonly ThemeDiagnostic[], dirty: boolean): FileStatus {
  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === "error").length;
  return { errors, warnings: diagnostics.length - errors, saved: !dirty };
}

export function readonlyJson(draft: ThemeDraft): string {
  return JSON.stringify(
    {
      name: draft.meta.name,
      scheme: draft.meta.scheme,
      startedFrom: draft.meta.startedFrom,
      contract: THEME_CONTRACT.version,
      follows: draft.meta.follows,
    },
    null,
    2
  );
}

function isNameCharacter(character: string): boolean {
  return (character >= "a" && character <= "z") || (character >= "0" && character <= "9") || character === "-";
}

export function newFilePath(name: string): string {
  return `${COMPONENTS_DIRECTORY}${name}${NEW_FILE_SUFFIX}`;
}

export function newFileProblem(name: string, draft: ThemeDraft): NewFileProblem | null {
  if (name === "" || !Array.from(name).every(isNameCharacter)) return "invalid";
  return Object.hasOwn(draft.files, newFilePath(name)) ? "taken" : null;
}

export function withFile(draft: ThemeDraft, path: string, text: string): ThemeDraft {
  return { ...draft, files: { ...draft.files, [path]: text } };
}

export function withoutFile(draft: ThemeDraft, path: string): ThemeDraft {
  return { ...draft, files: Object.fromEntries(Object.entries(draft.files).filter(([key]) => key !== path)) };
}

export function versionIsOpen(
  current: boolean,
  text: string,
  savedText: string | undefined,
  fetched: string | undefined
): boolean {
  if (fetched !== undefined) return fetched === text;
  return current && savedText === text;
}

export function cursorIn(text: string): number {
  const lines = text.split("\n");
  let offset = 0;
  for (const [index, line] of lines.entries()) {
    if (index > 0 && line.trim() === "") return offset + line.length;
    offset += line.length + 1;
  }
  return text.length;
}

export function insertionOf(text: string): Insertion {
  return { text, cursor: cursorIn(text) };
}

export function swatchOf(value: string | undefined): string | null {
  return value !== undefined && parseColor(value) !== null ? value : null;
}

function tokenCopyOf(copy: ThemeCopy, name: string): TokenCopy {
  return Object.hasOwn(copy.tokens, name) ? copy.tokens[name] : { label: name, hint: "" };
}

export function labelOf(copy: ThemeCopy, name: string): string {
  return tokenCopyOf(copy, name).label;
}

function partCopyOf(copy: ThemeCopy, name: string): string {
  return Object.hasOwn(copy.parts, name) ? copy.parts[name] : name;
}

function snippetCopyOf(copy: ThemeCopy, id: string): string {
  return Object.hasOwn(copy.snippets, id) ? copy.snippets[id] : id;
}

function partBlock(name: string): string {
  return `[data-part="${name}"] {\n  \n}`;
}

export function insertItems({ tokens, values, copy, category, query }: InsertQuery): InsertItem[] {
  const items: InsertItem[] = [];
  const wants = (own: Exclude<typeof category, "all">) => category === "all" || category === own;
  for (const token of tokens) {
    const own = token.kind === "color" ? "colors" : token.file === TYPOGRAPHY_FILE_ID ? "type" : "shape";
    if (!wants(own)) continue;
    const value = values.get(token.name);
    items.push({
      id: `token:${token.name}`,
      kind: "token",
      category: own,
      key: token.name,
      description: `${labelOf(copy, token.name)}, ${value ?? ""}`,
      swatch: token.kind === "color" ? swatchOf(value) : null,
      text: `var(${token.name})`,
    });
  }
  if (wants("parts")) {
    for (const part of THEME_CONTRACT.parts) {
      items.push({
        id: `part:${part.name}`,
        kind: "part",
        category: "parts",
        key: `[data-part="${part.name}"]`,
        description: partCopyOf(copy, part.name),
        swatch: null,
        text: partBlock(part.name),
      });
    }
  }
  if (wants("snippets")) {
    for (const snippet of SNIPPETS) {
      items.push({
        id: `snippet:${snippet.id}`,
        kind: "snippet",
        category: "snippets",
        key: snippet.name,
        description: snippetCopyOf(copy, snippet.id),
        swatch: null,
        text: snippet.body,
      });
    }
  }
  const needle = query.trim().toLowerCase();
  if (needle === "") return items;
  return items.filter((item) => `${item.key} ${item.description}`.toLowerCase().includes(needle));
}

export function minimalChange(previous: string, next: string): TextChange {
  const shortest = Math.min(previous.length, next.length);
  let start = 0;
  while (start < shortest && previous[start] === next[start]) start += 1;
  let previousEnd = previous.length;
  let nextEnd = next.length;
  while (previousEnd > start && nextEnd > start && previous[previousEnd - 1] === next[nextEnd - 1]) {
    previousEnd -= 1;
    nextEnd -= 1;
  }
  return { from: start, to: previousEnd, insert: next.slice(start, nextEnd) };
}

export function positionOf(doc: Text, line: number, column: number): number {
  const target = doc.line(clamp(line, 1, doc.lines));
  return target.from + clamp(column, 0, target.length);
}

export function diagnosticRange(
  doc: Text,
  diagnostic: Pick<ThemeDiagnostic, "line" | "column" | "endLine" | "endColumn">
): DocumentRange {
  const from = positionOf(doc, diagnostic.line, diagnostic.column - 1);
  const to = positionOf(doc, diagnostic.endLine, diagnostic.endColumn);
  if (to > from) return { from, to };
  if (from < doc.length) return { from, to: from + 1 };
  return { from: Math.max(0, from - 1), to: from };
}
