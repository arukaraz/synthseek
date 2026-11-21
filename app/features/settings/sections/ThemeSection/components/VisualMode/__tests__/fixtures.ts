import { vi } from "vitest";

import { THEME_CONTRACT } from "@theme/contract";
import { formatOklch, fromHex, toHex } from "@theme/custom";
import type { ThemeDraft } from "@theme/custom";

import { DEFAULT_EDITOR_VIEW } from "../../../constants";
import type { ThemeEditor } from "../../../types";

export const ALL_FOLLOWS = THEME_CONTRACT.tokens
  .filter((token) => token.follows !== undefined)
  .map((token) => token.name);

export const PICKED_HEX = toHex({ l: 0.6, c: 0.1, h: 250, alpha: 1 });

export const LIME = formatOklch({ l: 0.9, c: 0.2, h: 130, alpha: 1 });
export const MID_GRAY = formatOklch({ l: 0.75, c: 0, h: 0, alpha: 1 });
export const SOFT_VIOLET = formatOklch({ l: 0.66, c: 0.2, h: 285, alpha: 1 });

export function pickedWithOpacity(alpha: number): string {
  const picked = fromHex(PICKED_HEX);
  if (picked === null) throw new Error("the picked hex does not parse");
  return formatOklch({ ...picked, alpha });
}

export function makeDraft(follows: readonly string[] = ALL_FOLLOWS, files: Record<string, string> = {}): ThemeDraft {
  return { meta: { name: "Custom", scheme: "dark", startedFrom: "dark", follows: [...follows] }, files };
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
    view: { ...DEFAULT_EDITOR_VIEW },
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
