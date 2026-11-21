import type { ThemePresetId, ThemeScheme } from "@theme/contract";

export interface Oklch {
  l: number;
  c: number;
  h: number;
  alpha: number;
}

export interface ThemeMeta {
  name: string;
  scheme: ThemeScheme;
  startedFrom: ThemePresetId;
  follows: string[];
}

export interface ThemeDraft {
  meta: ThemeMeta;
  files: Record<string, string>;
}

export interface TokenDeclaration {
  name: string;
  value: string;
  valueStart: number;
  valueEnd: number;
}

export type TokenName = `--${string}`;

export interface ThemeFileText {
  path: string;
  text: string;
}

export interface UndoLog {
  past: string[];
  future: string[];
  last: string | null;
  at: number;
}

export interface DraftBase {
  meta: ThemeMeta;
  files: Record<string, string | null>;
}

export interface StoredDraft {
  at: number;
  draft: ThemeDraft;
  base?: DraftBase;
}

export interface FollowedDraft {
  draft: ThemeDraft;
  conflicts: string[];
}

export interface EditorSession {
  saved: ThemeDraft;
  draft: ThemeDraft;
  undo: UndoLog;
  restoredAt: number | null;
  conflicts: string[];
}

export interface ThemeDocument {
  synthseek: "theme";
  contract: number;
  name: string;
  scheme: ThemeScheme;
  startedFrom: ThemePresetId;
  follows: string[];
  files: Record<string, string>;
}
