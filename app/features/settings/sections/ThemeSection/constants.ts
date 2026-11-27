import { docsUrl } from "@utils/docs-url";

import { AI_ASSISTANTS_ANCHOR, APPS_TAB_HREF } from "../../constants";
import type { EditorView } from "./types";

export const DRAFT_STORAGE_PREFIX = "synthseek.theme.draft.";

export const DRAFT_PERSIST_DELAY_MS = 300;
export const DRAFT_CHECK_DELAY_MS = 350;

export const EDIT_PARAM = "edit";
export const EDIT_PARAM_VALUE = "1";
export const EDITOR_PATH = "/settings/customization/theme";

export const THEME_DOCS_URL = docsUrl("custom-themes/");
export const TOKEN_REFERENCE_URL = `${THEME_DOCS_URL}#tokens`;

export const AI_THEME_TIP_ID = "theme-by-ai";
export const AI_ASSISTANTS_HREF = `${APPS_TAB_HREF}#${AI_ASSISTANTS_ANCHOR}`;

export const DEFAULT_EDITOR_VIEW: EditorView = {
  mode: "visual",
  section: "brand",
  showAll: false,
  file: "tokens/brand.css",
  side: null,
};
