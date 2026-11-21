import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";
import type { EditorSession, ThemeDraft } from "@theme/custom";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type ThemeFilesData = RouterOutputs["theme"]["files"];
export type ThemeCheckResult = RouterOutputs["theme"]["check"]["results"][number];
export type ThemeDiagnostic = ThemeCheckResult["diagnostics"][number];
export type ThemeFontList = RouterOutputs["theme"]["fonts"];
export type ThemeVersion = RouterOutputs["theme"]["history"]["versions"][number];
export type ThemeImportCheck = RouterOutputs["theme"]["checkImport"];

export type EditorMode = "visual" | "css";
export type EditorSide = "insert" | "history";

export interface EditorView {
  mode: EditorMode;
  section: string;
  showAll: boolean;
  file: string;
  side: EditorSide | null;
}

export interface CheckedFile {
  text: string;
  diagnostics: ThemeDiagnostic[];
  css: string;
}

export interface EditorState {
  account: string;
  session: EditorSession;
  sent: ThemeDraft | null;
  checked: Record<string, CheckedFile>;
  view: EditorView;
}

export interface EditorModeProps {
  editor: ThemeEditor;
}

export interface ThemeEditor {
  draft: ThemeDraft;
  saved: ThemeDraft;
  dirty: boolean;
  restoredAt: number | null;
  conflicts: string[];
  broken: string[];
  checked: Record<string, CheckedFile>;
  canUndo: boolean;
  canRedo: boolean;
  saving: boolean;
  previewing: boolean;
  view: EditorView;
  change: (draft: ThemeDraft) => void;
  undo: () => void;
  redo: () => void;
  discard: () => void;
  save: () => void;
  keepMine: (path: string) => void;
  takeTheirs: (path: string) => void;
  setView: (patch: Partial<EditorView>) => void;
  startPreview: () => void;
  stopPreview: () => void;
}
