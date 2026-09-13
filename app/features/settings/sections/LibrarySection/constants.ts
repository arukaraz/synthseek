import type { GroupSelection, MoveClass } from "./types";

export const MOVE_CLASSES: MoveClass[] = ["relocate", "rename"];

export const DEFAULT_SELECTION: GroupSelection = { relocate: true, rename: false };

export const PREVIEW_DEBOUNCE_MS = 600;

export const PREVIEW_PAGE_SIZE = 25;

export const PAGE_SIZES = [25, 50, 100] as const;

export const MIN_SAMPLE_FOR_ESTIMATE = 25;

export const SAMPLE_LABELS = {
  single_disc: "libraryNaming.samples.single_disc",
  multi_disc: "libraryNaming.samples.multi_disc",
  guest_artist: "libraryNaming.samples.guest_artist",
} as const;
