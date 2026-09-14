import type { MoveClass } from "./types";

export const MOVE_CLASSES: readonly MoveClass[] = ["relocate", "rename", "reassign"];

export const PREVIEW_DEBOUNCE_MS = 600;

export const PREVIEW_PAGE_SIZE = 25;

export const PAGE_SIZES = [25, 50, 100] as const;

export const MIN_SAMPLE_FOR_ESTIMATE = 25;

export const EXTENSION_SUFFIX = ".{ext}";

export const EXTENSION_TOKEN = "{ext}";

export const SAMPLE_LABELS = {
  single_disc: "libraryNaming.samples.single_disc",
  multi_disc: "libraryNaming.samples.multi_disc",
  compilation: "libraryNaming.samples.compilation",
} as const;
