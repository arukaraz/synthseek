import type { Completion } from "@codemirror/autocomplete";
import type { Ref } from "react";

import type { ContractToken } from "@theme/contract";
import type { ThemeDraft } from "@theme/custom";

import type { EditorSide, ThemeDiagnostic, ThemeEditor, ThemeVersion } from "../../types";

export type InsertCategory = "all" | "colors" | "type" | "shape" | "parts" | "snippets";
export type InsertKind = "token" | "part" | "snippet";
export type CompletionKind = "token" | "part" | "general";
export type NewFileProblem = "invalid" | "taken";

export interface TokenCopy {
  label: string;
  hint: string;
}

export interface ThemeCopy {
  tokens: Record<string, TokenCopy>;
  parts: Record<string, string>;
  snippets: Record<string, string>;
}

export interface SnippetDefinition {
  id: string;
  name: string;
  body: string;
}

export interface Insertion {
  text: string;
  cursor: number;
}

export interface InsertItem {
  id: string;
  kind: InsertKind;
  category: Exclude<InsertCategory, "all">;
  key: string;
  description: string;
  swatch: string | null;
  text: string;
}

export interface InsertQuery {
  tokens: readonly ContractToken[];
  values: ReadonlyMap<string, string>;
  copy: ThemeCopy;
  category: InsertCategory;
  query: string;
}

export interface TreeFile {
  path: string;
  label: string;
  dirty: boolean;
  broken: boolean;
}

export interface FileTreeModel {
  tokens: TreeFile[];
  components: TreeFile[];
  custom: TreeFile | null;
}

export interface FileStatus {
  errors: number;
  warnings: number;
  saved: boolean;
}

export interface TextChange {
  from: number;
  to: number;
  insert: string;
}

export interface DocumentRange {
  from: number;
  to: number;
}

export interface CompletionContextInfo {
  kind: CompletionKind;
  word: string;
}

export interface CompletionLists {
  byName: readonly Completion[];
  general: readonly Completion[];
  parts: readonly Completion[];
  colorTokens: ReadonlySet<string>;
  tokenOf: WeakMap<Completion, string>;
}

export interface HeldDiagnostics {
  file: string;
  diagnostics: ThemeDiagnostic[];
}

export interface CodeEditorHandle {
  insert: (insertion: Insertion) => void;
  goTo: (line: number, column: number) => void;
  focus: () => void;
}

export interface CodeEditorProps {
  path: string;
  text: string;
  diagnostics: ThemeDiagnostic[];
  lists: CompletionLists;
  values: ReadonlyMap<string, string>;
  describe: (diagnostic: ThemeDiagnostic) => string;
  onChange: (text: string) => void;
  ref?: Ref<CodeEditorHandle>;
}

export interface EditorExtensionOptions {
  path: string;
  lists: CompletionLists;
  readValue: (name: string) => string | null;
  onChange: (text: string) => void;
}

export interface FileTreeProps {
  folder: string;
  model: FileTreeModel;
  open: string;
  draft: ThemeDraft;
  onOpen: (path: string) => void;
  onDelete: (path: string) => void;
  onCreate: (name: string) => void;
}

export interface TreeRowProps {
  file: TreeFile;
  current: boolean;
  top: boolean;
  onOpen: (path: string) => void;
  onDelete?: (path: string) => void;
}

export interface NewFileFormProps {
  draft: ThemeDraft;
  onCreate: (name: string) => void;
}

export interface EditorHeadProps {
  path: string;
  side: EditorSide | null;
  onSide: (side: EditorSide | null) => void;
}

export interface EditorFootProps {
  status: FileStatus | null;
}

export interface ProblemsListProps {
  diagnostics: ThemeDiagnostic[];
  describe: (diagnostic: ThemeDiagnostic) => string;
  onGoTo: (diagnostic: ThemeDiagnostic) => void;
}

export interface ReadonlyFileProps {
  draft: ThemeDraft;
}

export interface DiskNoticeProps {
  onReload: () => void;
  onKeep: () => void;
}

export interface InsertPanelProps {
  values: ReadonlyMap<string, string>;
  copy: ThemeCopy;
  onInsert: (insertion: Insertion) => void;
}

export interface HistoryPanelProps {
  editor: ThemeEditor;
  path: string;
  generated: boolean;
}

export interface HistoryRowProps {
  version: ThemeVersion;
  savedNow: boolean;
  disabled: boolean;
  onRestore: (version: ThemeVersion) => void;
}

export interface UseCodeEditorOptions {
  path: string;
  text: string;
  diagnostics: ThemeDiagnostic[];
  lists: CompletionLists;
  values: ReadonlyMap<string, string>;
  describe: (diagnostic: ThemeDiagnostic) => string;
  onChange: (text: string) => void;
  ref?: Ref<CodeEditorHandle>;
}
