import type { GroupSelection, MoveClass } from "./types";

export const MOVE_CLASSES: MoveClass[] = ["relocate", "rename"];

export const DEFAULT_SELECTION: GroupSelection = { relocate: true, rename: false };

export const PREVIEW_DEBOUNCE_MS = 600;
