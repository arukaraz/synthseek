import { vi } from "vitest";

import { THEME_CONTRACT } from "@theme/contract";
import { tokenPathOf } from "@theme/custom";
import type { ThemeDraft } from "@theme/custom";

import type { ThemeDiagnostic, ThemeEditor } from "../../../types";

export function draftOf(files: Record<string, string> = {}): ThemeDraft {
  const base = Object.fromEntries(THEME_CONTRACT.files.map((file) => [tokenPathOf(file.id), ":root {\n}\n"]));
  return {
    meta: { name: "Mine", scheme: "dark", startedFrom: "dark", follows: [] },
    files: { ...base, ...files },
  };
}

export function editorOf(overrides: Partial<ThemeEditor> = {}): ThemeEditor {
  const draft = draftOf();
  return {
    draft,
    saved: draft,
    dirty: false,
    restoredAt: null,
    conflicts: [],
    leftOut: [],
    broken: [],
    checked: {},
    canUndo: false,
    canRedo: false,
    saving: false,
    previewing: false,
    view: { mode: "css", section: "brand", showAll: false, file: "tokens/brand.css", side: null },
    change: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    discard: vi.fn(),
    save: vi.fn(),
    keepMine: vi.fn(),
    takeTheirs: vi.fn(),
    setView: vi.fn(),
    startPreview: vi.fn(),
    stopPreview: vi.fn(),
    ...overrides,
  };
}

export function diagnosticOf(overrides: Partial<ThemeDiagnostic> = {}): ThemeDiagnostic {
  return {
    severity: "error",
    code: "syntax",
    detail: "Unclosed block",
    line: 2,
    column: 3,
    endLine: 2,
    endColumn: 5,
    ...overrides,
  };
}
