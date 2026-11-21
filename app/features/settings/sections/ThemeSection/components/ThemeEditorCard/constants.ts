import type { ExternalToast } from "sonner";

export const SURFACE_TOKEN = "--surface-bg";

export const DARK_SURFACE_LUMINANCE = 0.25;

export const TOOLTIP_DELAY_MS = 150;

export const TOUCH_QUERY = "(hover: none)";

export const PREVIEW_PATH = "/";

export const UNDO_KEY = "z";

export const SAVED_TOAST_OPTIONS: ExternalToast = { position: "top-center" };

export const NON_TEXT_INPUT_TYPES: ReadonlyArray<string> = [
  "checkbox",
  "radio",
  "range",
  "color",
  "file",
  "button",
  "submit",
  "reset",
  "image",
];
