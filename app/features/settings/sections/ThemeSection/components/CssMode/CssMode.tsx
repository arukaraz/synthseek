"use client";

import { useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Notice } from "@components/ui/Notice";
import { useThemeFiles } from "@hooks/api/queries/theme";
import { draftValues } from "@theme/custom";
import { useThemeContext } from "@theme/ThemeProvider";

import type { EditorSide, EditorModeProps, ThemeDiagnostic } from "../../types";
import { CodeEditor } from "./components/CodeEditor";
import { DiskNotice } from "./components/DiskNotice";
import { EditorFoot } from "./components/EditorFoot";
import { EditorHead } from "./components/EditorHead";
import { FileTree } from "./components/FileTree";
import { HistoryPanel } from "./components/HistoryPanel";
import { InsertPanel } from "./components/InsertPanel";
import { ProblemsList } from "./components/ProblemsList";
import { ReadonlyFile } from "./components/ReadonlyFile";
import { buildCompletionLists } from "./completion";
import { THEME_JSON_PATH } from "./constants";
import { fileStatusOf, firstTokenPath, newFilePath, resolveOpenFile, treeOf, withFile, withoutFile } from "./helpers";
import { useHeldDiagnostics } from "./hooks/useHeldDiagnostics";
import { useThemeCopy } from "./hooks/useThemeCopy";
import { codeBody, codeFrame, cssModeGrid, editorColumn } from "./styles";
import type { CodeEditorHandle, Insertion } from "./types";

export function CssMode({ editor }: EditorModeProps) {
  const { t } = useTranslation("themeEditor");
  const { custom } = useThemeContext();
  const files = useThemeFiles(true);
  const copy = useThemeCopy();
  const editorRef = useRef<CodeEditorHandle | null>(null);

  const { draft, saved, view, checked, broken, conflicts } = editor;
  const path = resolveOpenFile(view.file, draft);
  const generated = path === THEME_JSON_PATH;
  const text = generated ? "" : draft.files[path];
  const dirty = !generated && (!Object.hasOwn(saved.files, path) || saved.files[path] !== text);

  const lists = useMemo(() => buildCompletionLists(copy), [copy]);
  const values = useMemo(() => draftValues(draft), [draft]);
  const model = useMemo(() => treeOf(draft, saved, broken), [draft, saved, broken]);
  const diagnostics = useHeldDiagnostics(path, text, Object.hasOwn(checked, path) ? checked[path] : undefined);
  const unreadable = files.data?.files.some((file) => file.path === path && file.unreadable) ?? false;

  const describe = useCallback(
    (diagnostic: ThemeDiagnostic) => t(`problems.${diagnostic.code}`, { detail: diagnostic.detail ?? "" }),
    [t]
  );

  const change = (next: string) => editor.change(withFile(draft, path, next));

  const open = (target: string) => editor.setView({ file: target });

  const create = (name: string) => {
    const created = newFilePath(name);
    editor.change(withFile(draft, created, ""));
    editor.setView({ file: created });
  };

  const remove = (target: string) => {
    editor.change(withoutFile(draft, target));
    if (target === path) editor.setView({ file: firstTokenPath() });
  };

  const toggleSide = (side: EditorSide | null) => editor.setView({ side });

  const insert = (insertion: Insertion) => {
    if (editorRef.current === null) {
      toast(t("css.openFileFirst"));
      return;
    }
    editorRef.current.insert(insertion);
  };

  const side = view.side;

  return (
    <div className={cssModeGrid({ side: side !== null })}>
      <FileTree
        folder={custom?.folder ?? ""}
        model={model}
        open={path}
        draft={draft}
        onOpen={open}
        onDelete={remove}
        onCreate={create}
      />
      <div className={editorColumn({ side: side !== null })}>
        <div className="flex min-w-0 flex-col gap-2.5">
          {conflicts.includes(path) ? (
            <DiskNotice onReload={() => editor.takeTheirs(path)} onKeep={() => editor.keepMine(path)} />
          ) : null}
          {unreadable ? <Notice variant="warning" title={t("css.unreadable")} /> : null}
          <div className={codeFrame()}>
            <EditorHead path={path} side={side} onSide={toggleSide} />
            {generated ? (
              <ReadonlyFile draft={draft} />
            ) : (
              <div className={codeBody()}>
                <CodeEditor
                  key={path}
                  ref={editorRef}
                  path={path}
                  text={text}
                  diagnostics={diagnostics}
                  lists={lists}
                  values={values}
                  describe={describe}
                  onChange={change}
                />
              </div>
            )}
            {generated ? null : (
              <ProblemsList
                diagnostics={diagnostics}
                describe={describe}
                onGoTo={(diagnostic) => editorRef.current?.goTo(diagnostic.line, diagnostic.column)}
              />
            )}
            <EditorFoot status={generated ? null : fileStatusOf(diagnostics, dirty)} />
          </div>
        </div>
        {side === "insert" ? <InsertPanel values={values} copy={copy} onInsert={insert} /> : null}
        {side === "history" ? <HistoryPanel editor={editor} path={path} generated={generated} /> : null}
      </div>
    </div>
  );
}
