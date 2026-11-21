import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { css } from "@codemirror/lang-css";
import { indentUnit } from "@codemirror/language";
import { lintGutter } from "@codemirror/lint";
import { Annotation, EditorState } from "@codemirror/state";
import type { Extension } from "@codemirror/state";
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  tooltips,
} from "@codemirror/view";

import { completionExtension } from "./completion";
import { INDENT_UNIT } from "./constants";
import { editorSyntax, editorTheme } from "./editorTheme";
import type { EditorExtensionOptions } from "./types";

export const externalChange = Annotation.define<boolean>();

export function editorExtensions({ path, lists, readValue, onChange }: EditorExtensionOptions): Extension[] {
  return [
    lintGutter(),
    lineNumbers(),
    highlightActiveLine(),
    highlightActiveLineGutter(),
    drawSelection(),
    css(),
    editorSyntax,
    editorTheme,
    indentUnit.of(INDENT_UNIT),
    EditorState.tabSize.of(INDENT_UNIT.length),
    tooltips({ parent: document.body }),
    completionExtension(lists, readValue),
    keymap.of([...defaultKeymap, indentWithTab]),
    EditorView.contentAttributes.of({
      "aria-label": path,
      spellcheck: "false",
      autocapitalize: "off",
      autocorrect: "off",
    }),
    EditorView.updateListener.of((update) => {
      if (!update.docChanged) return;
      if (update.transactions.some((transaction) => transaction.annotation(externalChange) === true)) return;
      onChange(update.state.doc.toString());
    }),
  ];
}
