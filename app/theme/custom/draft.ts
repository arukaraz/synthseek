import { THEME_CONTRACT, THEME_PRESETS } from "@theme/contract";
import type { ThemePresetId, ThemeScheme } from "@theme/contract";

import { COMPONENTS_DIRECTORY, CUSTOM_FILE, TOKENS_DIRECTORY } from "./constants";
import { valuesOf } from "./declarations";
import type { ThemeDocument, ThemeDraft } from "./types";

const CSS_EXTENSION = ".css";

interface PresetFiles {
  files: { path: string; text: string }[];
  follows: string[];
}

interface ImportedTheme extends PresetFiles {
  name: string;
  scheme: ThemeScheme;
  startedFrom: ThemePresetId;
}

function isDirectChild(path: string, directory: string): boolean {
  if (!path.startsWith(directory) || !path.endsWith(CSS_EXTENSION)) return false;
  const name = path.slice(directory.length, -CSS_EXTENSION.length);
  return name.length > 0 && !name.includes("/");
}

export function isTokenPath(path: string): boolean {
  return isDirectChild(path, TOKENS_DIRECTORY);
}

export function isFreePath(path: string): boolean {
  return path === CUSTOM_FILE || isDirectChild(path, COMPONENTS_DIRECTORY);
}

export function tokenPathOf(fileId: string): string {
  return `${TOKENS_DIRECTORY}${fileId}${CSS_EXTENSION}`;
}

export function presetValues(presetId: ThemePresetId): Record<string, string> {
  return THEME_PRESETS[presetId] ?? {};
}

export function sameDraft(a: ThemeDraft, b: ThemeDraft): boolean {
  if (a.meta.name !== b.meta.name || a.meta.scheme !== b.meta.scheme || a.meta.startedFrom !== b.meta.startedFrom) {
    return false;
  }
  const followsA = new Set(a.meta.follows);
  const followsB = new Set(b.meta.follows);
  if (followsA.size !== followsB.size) return false;
  for (const name of followsA) {
    if (!followsB.has(name)) return false;
  }
  const pathsA = Object.keys(a.files);
  if (pathsA.length !== Object.keys(b.files).length) return false;
  return pathsA.every((path) => Object.hasOwn(b.files, path) && a.files[path] === b.files[path]);
}

export function changedPaths(saved: ThemeDraft, draft: ThemeDraft): string[] {
  return Object.keys(draft.files)
    .filter((path) => !Object.hasOwn(saved.files, path) || saved.files[path] !== draft.files[path])
    .sort();
}

export function removedPaths(saved: ThemeDraft, draft: ThemeDraft): string[] {
  return Object.keys(saved.files)
    .filter((path) => !Object.hasOwn(draft.files, path))
    .sort();
}

export function draftValues(draft: ThemeDraft): Map<string, string> {
  const values = new Map(Object.entries(presetValues(draft.meta.startedFrom)));
  for (const [path, text] of Object.entries(draft.files)) {
    if (!isTokenPath(path)) continue;
    for (const [name, value] of valuesOf(text)) values.set(name, value);
  }
  return values;
}

export function exportDocument(draft: ThemeDraft, options: { includeFreeCss: boolean }): ThemeDocument {
  const files: Record<string, string> = {};
  for (const [path, text] of Object.entries(draft.files)) {
    if (isTokenPath(path) || (options.includeFreeCss && isFreePath(path))) files[path] = text;
  }
  return {
    synthseek: "theme",
    contract: THEME_CONTRACT.version,
    name: draft.meta.name,
    scheme: draft.meta.scheme,
    startedFrom: draft.meta.startedFrom,
    follows: [...draft.meta.follows],
    files,
  };
}

export function withPreset(draft: ThemeDraft, preset: PresetFiles, presetId: ThemePresetId): ThemeDraft {
  const files: Record<string, string> = {};
  for (const file of preset.files) files[file.path] = file.text;
  for (const [path, text] of Object.entries(draft.files)) {
    if (!isTokenPath(path)) files[path] = text;
  }
  return { meta: { ...draft.meta, startedFrom: presetId, follows: [...preset.follows] }, files };
}

export function withImport(draft: ThemeDraft, imported: ImportedTheme, tokensOnly: boolean): ThemeDraft {
  const files: Record<string, string> = { ...draft.files };
  for (const file of imported.files) {
    if (isTokenPath(file.path) || (!tokensOnly && isFreePath(file.path))) files[file.path] = file.text;
  }
  return {
    meta: {
      name: imported.name,
      scheme: imported.scheme,
      startedFrom: imported.startedFrom,
      follows: [...imported.follows],
    },
    files,
  };
}
