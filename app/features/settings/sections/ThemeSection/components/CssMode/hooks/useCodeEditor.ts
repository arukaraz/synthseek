"use client";

import { setDiagnostics } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { useEffect, useImperativeHandle, useRef } from "react";
import type { RefObject } from "react";

import { editorExtensions, externalChange } from "../extensions";
import { diagnosticRange, minimalChange, positionOf } from "../helpers";
import type { UseCodeEditorOptions } from "../types";

export function useCodeEditor({
  path,
  text,
  diagnostics,
  lists,
  values,
  describe,
  onChange,
  ref,
}: UseCodeEditorOptions): RefObject<HTMLDivElement | null> {
  const host = useRef<HTMLDivElement | null>(null);
  const view = useRef<EditorView | null>(null);
  const latest = useRef({ text, values, describe, onChange });

  useEffect(() => {
    latest.current = { text, values, describe, onChange };
  });

  useEffect(() => {
    const parent = host.current;
    if (parent === null) return;
    const created = new EditorView({
      parent,
      state: EditorState.create({
        doc: latest.current.text,
        extensions: editorExtensions({
          path,
          lists,
          readValue: (name) => latest.current.values.get(name) ?? null,
          onChange: (next) => latest.current.onChange(next),
        }),
      }),
    });
    view.current = created;
    return () => {
      created.destroy();
      view.current = null;
    };
  }, [path, lists]);

  useEffect(() => {
    const current = view.current;
    if (current === null) return;
    const existing = current.state.doc.toString();
    if (existing === text) return;
    current.dispatch({ changes: minimalChange(existing, text), annotations: externalChange.of(true) });
  }, [text]);

  useEffect(() => {
    const current = view.current;
    if (current === null) return;
    const marks = diagnostics.map((diagnostic) => ({
      ...diagnosticRange(current.state.doc, diagnostic),
      severity: diagnostic.severity,
      message: latest.current.describe(diagnostic),
    }));
    current.dispatch(setDiagnostics(current.state, marks));
  }, [diagnostics, path, lists]);

  useImperativeHandle(
    ref,
    () => ({
      insert: ({ text: inserted, cursor }) => {
        const current = view.current;
        if (current === null) return;
        const { from, to } = current.state.selection.main;
        current.dispatch({
          changes: { from, to, insert: inserted },
          selection: { anchor: from + cursor },
          scrollIntoView: true,
          userEvent: "input",
        });
        current.focus();
      },
      goTo: (line, column) => {
        const current = view.current;
        if (current === null) return;
        current.dispatch({
          selection: { anchor: positionOf(current.state.doc, line, column - 1) },
          scrollIntoView: true,
        });
        current.focus();
      },
      focus: () => view.current?.focus(),
    }),
    []
  );

  return host;
}
