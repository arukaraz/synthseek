import type { ThemeDiagnostic } from "../../types";
import type { InsertCategory, SnippetDefinition, TreeFile } from "./types";

export const THEME_JSON_PATH = "theme.json";
export const THEME_JSON_ENTRY: TreeFile = {
  path: THEME_JSON_PATH,
  label: THEME_JSON_PATH,
  dirty: false,
  broken: false,
};
export const THEME_ROOT = "/data/theme/";
export const NEW_FILE_SUFFIX = ".css";
export const TYPOGRAPHY_FILE_ID = "typography";

export const COMPLETION_DELAY_MS = 1000;
export const COMPLETION_LOOKBEHIND = 80;
export const COMPLETION_MIN_WORD = 2;
export const MAX_PROBLEMS_SHOWN = 4;
export const HISTORY_TOOLTIP_DELAY_MS = 150;
export const INDENT_UNIT = "  ";
export const PART_CONTEXT_PREFIXES: readonly string[] = ['[data-part="', "[data-part='"];
export const VAR_CONTEXT_PREFIX = "var(";
export const CUSTOM_PROPERTY_PREFIX = "--";

export const INSERT_CATEGORIES: readonly InsertCategory[] = ["all", "colors", "type", "shape", "parts", "snippets"];

export const EMPTY_DIAGNOSTICS: ThemeDiagnostic[] = [];

export const SNIPPETS: readonly SnippetDefinition[] = [
  { id: "part", name: "part", body: '[data-part="widget"] {\n  \n}' },
  {
    id: "tint",
    name: "tint",
    body: "color-mix(in oklab, var(--color-primary-500) 20%, transparent)",
  },
  {
    id: "glass",
    name: "glass",
    body: "background: color-mix(in oklab, var(--surface-bg-elevated) 70%, transparent);\n  backdrop-filter: blur(var(--glass-blur));\n  border: var(--border-width) solid var(--border-default);",
  },
  {
    id: "gradient",
    name: "gradient",
    body: "background-image: linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500));",
  },
  {
    id: "gradientText",
    name: "gradient-text",
    body: "background: linear-gradient(to top right, var(--color-primary-500), var(--color-secondary-500));\n  background-clip: text;\n  color: transparent;",
  },
  { id: "hide", name: "hide", body: '[data-part="widget-title"] {\n  display: none;\n}' },
  { id: "accent", name: "accent", body: '[data-part="widget"][data-acc="daily"] {\n  \n}' },
  { id: "phone", name: "phone", body: "@media (max-width: 640px) {\n  \n}" },
  { id: "desktop", name: "desktop", body: "@media (min-width: 1024px) {\n  \n}" },
  {
    id: "focus",
    name: "focus",
    body: ":focus-visible {\n  outline: 2px solid var(--ring);\n  outline-offset: 2px;\n}",
  },
  {
    id: "fontFace",
    name: "font-face",
    body: '@font-face {\n  font-family: "My font";\n  src: url("fonts/my-font.woff2") format("woff2");\n  font-display: swap;\n}',
  },
  {
    id: "motion",
    name: "motion",
    body: "@media (prefers-reduced-motion: no-preference) {\n  \n}",
  },
];
