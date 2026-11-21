import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

const mixed = (token: string, share: number) => `color-mix(in oklab, var(${token}) ${share}%, var(--surface-fg))`;

const underline = (token: string) => ({
  backgroundImage: "none",
  paddingBottom: "0",
  textDecoration: `underline wavy var(${token})`,
  textDecorationSkipInk: "none",
  textUnderlineOffset: "3px",
});

const marker = (token: string, radius: string) => ({
  content: "none",
  backgroundColor: `var(${token})`,
  borderRadius: radius,
  width: "0.6em",
  height: "0.6em",
  margin: "0.35em auto 0",
});

const surfaceTooltip = {
  backgroundColor: "var(--surface-bg-overlay)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius)",
  color: "var(--surface-fg)",
  boxShadow: "0 10px 24px color-mix(in oklab, var(--shadow-color) 45%, transparent)",
};

export const editorTheme: Extension = EditorView.theme({
  "&": {
    height: "100%",
    color: "var(--surface-fg)",
    backgroundColor: "var(--surface-bg-sunken)",
    fontSize: "0.75rem",
  },
  "&.cm-focused": { outline: "2px solid var(--ring)", outlineOffset: "-2px" },
  ".cm-scroller": { "font-family": "var(--font-mono)", lineHeight: "1.6", overflow: "auto" },
  ".cm-content": { caretColor: "var(--surface-fg)", padding: "0.625rem 0" },
  ".cm-line": { padding: "0 0.75rem" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--surface-fg)" },
  ".cm-selectionBackground, &.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    backgroundColor: "color-mix(in oklab, var(--color-primary-500) 40%, transparent)",
  },
  ".cm-activeLine": { backgroundColor: "color-mix(in oklab, var(--surface-fg) 5%, transparent)" },
  ".cm-gutters": {
    backgroundColor: "var(--surface-bg-sunken)",
    color: "color-mix(in oklab, var(--surface-fg-muted) 70%, transparent)",
    borderRight: "1px solid var(--border-default)",
    borderLeft: "0",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "color-mix(in oklab, var(--surface-fg) 5%, transparent)",
    color: "var(--surface-fg)",
  },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 0.5rem 0 0.75rem" },
  ".cm-gutter-lint": { width: "1.1em" },
  ".cm-lint-marker-error": marker("--destructive-vivid", "9999px"),
  ".cm-lint-marker-warning": marker("--warning-vivid", "0.15em"),
  ".cm-lintRange-error": underline("--destructive-vivid"),
  ".cm-lintRange-warning": underline("--warning-vivid"),
  ".cm-tooltip": surfaceTooltip,
  ".cm-tooltip.cm-tooltip-autocomplete > ul": {
    "font-family": "var(--font-mono)",
    fontSize: "0.75rem",
    maxHeight: "14rem",
  },
  ".cm-tooltip.cm-tooltip-autocomplete > ul > li": {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.25rem 0.5rem",
    color: "var(--surface-fg)",
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    backgroundColor: "color-mix(in oklab, var(--color-primary-500) 26%, transparent)",
    color: "var(--surface-fg)",
  },
  ".cm-completionLabel": { whiteSpace: "nowrap" },
  ".cm-completionDetail": {
    marginLeft: "auto",
    fontStyle: "normal",
    color: "var(--surface-fg-muted)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "10rem",
  },
  ".cm-completionMatchedText": { textDecoration: "none", fontWeight: "700" },
  ".cm-theme-swatch": {
    flex: "none",
    width: "0.75rem",
    height: "0.75rem",
    border: "1px solid var(--border-default)",
    borderRadius: "calc(var(--radius) * 0.4)",
  },
  ".cm-theme-swatch-empty": { visibility: "hidden" },
  ".cm-diagnostic": { "font-family": "inherit", color: "var(--surface-fg)" },
  ".cm-diagnostic-error": { borderLeft: "4px solid var(--destructive-vivid)" },
  ".cm-diagnostic-warning": { borderLeft: "4px solid var(--warning-vivid)" },
});

export const highlightStyle = HighlightStyle.define([
  {
    tag: [tags.comment, tags.blockComment],
    color: "color-mix(in oklab, var(--surface-fg-muted) 80%, transparent)",
    fontStyle: "italic",
  },
  { tag: tags.propertyName, color: mixed("--color-primary-500", 55) },
  { tag: tags.variableName, color: mixed("--color-secondary-500", 62) },
  { tag: [tags.number, tags.unit], color: mixed("--warning-vivid", 70) },
  { tag: [tags.string, tags.color], color: mixed("--success-vivid", 70) },
  { tag: [tags.keyword, tags.definitionKeyword, tags.modifier], color: mixed("--color-accent-500", 65) },
  {
    tag: [tags.className, tags.tagName, tags.labelName, tags.attributeName, tags.constant(tags.className)],
    color: mixed("--color-accent-500", 45),
  },
  { tag: [tags.atom, tags.operatorKeyword], color: mixed("--info-vivid", 60) },
  {
    tag: [tags.punctuation, tags.separator, tags.paren, tags.squareBracket, tags.brace],
    color: "var(--surface-fg-muted)",
  },
]);

export const editorSyntax: Extension = syntaxHighlighting(highlightStyle);
