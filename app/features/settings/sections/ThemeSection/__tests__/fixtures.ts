import { vi } from "vitest";

import { formatOklch } from "@theme/custom";
import type { ThemeDraft } from "@theme/custom";

import { DEFAULT_EDITOR_VIEW } from "../constants";
import type { ThemeEditor } from "../types";

export function colorOf(lightness: number, chroma = 0, hue = 0): string {
  return formatOklch({ l: lightness, c: chroma, h: hue, alpha: 1 });
}

export function tokenFile(name: string, value: string): string {
  return `:root {\n  ${name}: ${value};\n}\n`;
}

export function makeDraft(overrides: Partial<ThemeDraft["meta"]> = {}, files: Record<string, string> = {}): ThemeDraft {
  return {
    meta: { name: "Mine", scheme: "dark", startedFrom: "dark", follows: [], ...overrides },
    files,
  };
}

export function surfaceFiles(color: string): Record<string, string> {
  return { "tokens/surfaces.css": tokenFile("--surface-bg", color) };
}

export function makeEditor(overrides: Partial<ThemeEditor> = {}): ThemeEditor {
  const draft = makeDraft();
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
    view: DEFAULT_EDITOR_VIEW,
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
