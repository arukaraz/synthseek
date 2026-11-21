import type { EditorView } from "./types";

export const DRAFT_STORAGE_PREFIX = "synthseek.theme.draft.";

export const DRAFT_PERSIST_DELAY_MS = 300;
export const DRAFT_CHECK_DELAY_MS = 350;

export const EDIT_PARAM = "edit";
export const EDIT_PARAM_VALUE = "1";
export const EDITOR_PATH = "/settings/customization/theme";

export const THEME_DOCS_URL = "https://docs.synthseek.dev/custom-themes/";
export const TOKEN_REFERENCE_URL = `${THEME_DOCS_URL}#tokens`;

export const DEFAULT_EDITOR_VIEW: EditorView = {
  mode: "visual",
  section: "brand",
  showAll: false,
  file: "tokens/brand.css",
  side: null,
};
