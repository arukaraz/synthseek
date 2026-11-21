import { THEME_CONTRACT } from "@theme/contract";
import {
  CUSTOM_FILE,
  fontFaceBlock,
  isFreePath,
  parseStoredDraft,
  schemeBlock,
  serializeStoredDraft,
  tokenBlock,
  tokenPathOf,
} from "@theme/custom";
import type { StoredDraft, ThemeDraft } from "@theme/custom";

import { DRAFT_STORAGE_PREFIX } from "./constants";
import type { CheckedFile, EditorState, ThemeCheckResult, ThemeFilesData, ThemeFontList } from "./types";

export function leftOutPaths(data: ThemeFilesData | undefined): string[] {
  return (data?.files ?? []).filter((file) => file.leftOut).map((file) => file.path);
}

export function appliedFiles(data: ThemeFilesData | undefined): ThemeFilesData["files"] | undefined {
  return data?.files.filter((file) => !file.leftOut);
}

export function appliedFontFiles(fonts: ThemeFontList | undefined): string[] {
  return (fonts?.fonts ?? []).filter((font) => !font.leftOut).map((font) => font.file);
}

export function savedDraftOf(data: ThemeFilesData): ThemeDraft {
  const files: Record<string, string> = {};
  for (const file of data.files) files[file.path] = file.text;
  return {
    meta: {
      name: data.meta.name,
      scheme: data.meta.scheme,
      startedFrom: data.meta.startedFrom,
      follows: [...data.meta.follows],
    },
    files,
  };
}

export function readStoredDraft(account: string): StoredDraft | null {
  try {
    return parseStoredDraft(window.localStorage.getItem(`${DRAFT_STORAGE_PREFIX}${account}`));
  } catch {
    return null;
  }
}

export function writeStoredDraft(account: string, draft: ThemeDraft | null, saved: ThemeDraft, now: number): void {
  try {
    const key = `${DRAFT_STORAGE_PREFIX}${account}`;
    if (draft === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, serializeStoredDraft(draft, saved, now));
  } catch {
    return;
  }
}

function freePathsOf(draft: ThemeDraft): string[] {
  const components = Object.keys(draft.files)
    .filter((path) => isFreePath(path) && path !== CUSTOM_FILE)
    .sort();
  return Object.hasOwn(draft.files, CUSTOM_FILE) ? [...components, CUSTOM_FILE] : components;
}

export function draftCss(
  draft: ThemeDraft,
  checked: Record<string, CheckedFile>,
  fonts: readonly string[],
  leftOut: readonly string[]
): string {
  const applied = (path: string) => !leftOut.includes(path);
  const tokenFiles = THEME_CONTRACT.files
    .map((file) => tokenPathOf(file.id))
    .filter((path) => Object.hasOwn(draft.files, path) && applied(path))
    .map((path) => ({ path, text: draft.files[path] }));
  const free = freePathsOf(draft)
    .filter(applied)
    .map((path) => (Object.hasOwn(checked, path) ? checked[path].css : ""));
  return [fontFaceBlock(fonts), schemeBlock(draft.meta.scheme), tokenBlock(tokenFiles), ...free]
    .filter((part) => part !== "")
    .join("\n");
}

export function uncheckedFiles(
  draft: ThemeDraft,
  checked: Record<string, CheckedFile>
): { path: string; text: string }[] {
  return Object.entries(draft.files)
    .filter(([path, text]) => !Object.hasOwn(checked, path) || checked[path].text !== text)
    .map(([path, text]) => ({ path, text }));
}

export function withChecks(
  state: EditorState,
  asked: readonly { path: string; text: string }[],
  results: readonly ThemeCheckResult[]
): Record<string, CheckedFile> {
  const texts = new Map(asked.map((file) => [file.path, file.text]));
  const next: Record<string, CheckedFile> = {};
  for (const [path, check] of Object.entries(state.checked)) {
    if (Object.hasOwn(state.session.draft.files, path)) next[path] = check;
  }
  for (const result of results) {
    const text = texts.get(result.path);
    if (text !== undefined) next[result.path] = { text, diagnostics: result.diagnostics, css: result.css };
  }
  return next;
}

export function brokenPaths(draft: ThemeDraft, checked: Record<string, CheckedFile>): string[] {
  return Object.keys(draft.files)
    .filter(
      (path) =>
        Object.hasOwn(checked, path) &&
        checked[path].text === draft.files[path] &&
        checked[path].diagnostics.some((diagnostic) => diagnostic.severity === "error")
    )
    .sort();
}
