"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

import { useCheckTheme, useSaveTheme } from "@hooks/api/mutations/theme";
import { useThemeFetchers, useThemeFiles, useThemeFonts } from "@hooks/api/queries/theme";
import { useAuthContext } from "@modules/providers/AuthProvider";
import {
  adoptSaved,
  canRedo,
  canUndo,
  changedPaths,
  discardSession,
  editSession,
  isDirty,
  keepMine,
  openSession,
  redoSession,
  removedPaths,
  takeTheirs,
  undoSession,
} from "@theme/custom";
import type { ThemeDraft } from "@theme/custom";
import { useThemeContext } from "@theme/ThemeProvider";

import { DEFAULT_EDITOR_VIEW, DRAFT_CHECK_DELAY_MS, DRAFT_PERSIST_DELAY_MS } from "../constants";
import {
  brokenPaths,
  draftCss,
  readStoredDraft,
  savedDraftOf,
  uncheckedFiles,
  withChecks,
  writeStoredDraft,
} from "../helpers";
import type { EditorView, ThemeEditor } from "../types";
import { noEditor, patchEditor, readEditor, subscribeEditor, writeEditor } from "./editorStore";

export function useThemeEditor(): ThemeEditor | null {
  const { currentUser } = useAuthContext();
  const account = currentUser?.id ?? null;
  const { custom, applyDraft, previewing, startPreview, stopPreview } = useThemeContext();
  const files = useThemeFiles(account !== null && custom !== null);
  const fonts = useThemeFonts(account !== null && custom !== null);
  const { mutateAsync: saveTheme } = useSaveTheme();
  const { mutateAsync: checkFiles } = useCheckTheme();
  const { files: fetchFiles } = useThemeFetchers();
  const stored = useSyncExternalStore(subscribeEditor, readEditor, noEditor);
  const state = stored !== null && stored.account === account ? stored : null;
  const saving = state !== null && state.sent !== null;
  const session = state?.session ?? null;
  const draft = session?.draft ?? null;
  const checked = state?.checked ?? null;
  const dirty = session !== null && isDirty(session);

  useEffect(() => {
    if (account === null || files.data === undefined) return;
    const saved = savedDraftOf(files.data);
    const current = readEditor();
    if (current === null || current.account !== account) {
      writeEditor({
        account,
        session: openSession(saved, readStoredDraft(account)),
        sent: null,
        checked: {},
        view: DEFAULT_EDITOR_VIEW,
      });
      return;
    }
    if (current.sent !== null) return;
    writeEditor({ ...current, session: adoptSaved(current.session, saved, null, Date.now()) });
  }, [account, files.data]);

  useEffect(() => {
    if (account === null || draft === null) return;
    const timer = window.setTimeout(
      () => writeStoredDraft(account, dirty ? draft : null, Date.now()),
      DRAFT_PERSIST_DELAY_MS
    );
    return () => window.clearTimeout(timer);
  }, [account, draft, dirty]);

  useEffect(() => {
    if (draft === null || checked === null) return;
    const pending = uncheckedFiles(draft, checked);
    if (pending.length === 0) return;
    const timer = window.setTimeout(() => {
      void checkFiles({ files: pending })
        .then(({ results }) =>
          patchEditor((current) => ({ ...current, checked: withChecks(current, pending, results) }))
        )
        .catch(() => undefined);
    }, DRAFT_CHECK_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [draft, checked, checkFiles]);

  const fontFiles = useMemo(() => (fonts.data?.fonts ?? []).map((font) => font.file), [fonts.data]);
  const css = useMemo(
    () => (draft === null || checked === null ? null : draftCss(draft, checked, fontFiles)),
    [draft, checked, fontFiles]
  );
  const base = draft?.meta.startedFrom ?? null;
  const scheme = draft?.meta.scheme ?? null;

  useEffect(() => {
    if (css === null || base === null || scheme === null) return;
    applyDraft({ css, base, scheme, unsaved: dirty });
  }, [applyDraft, css, base, scheme, dirty]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const change = useCallback((next: ThemeDraft) => {
    patchEditor((current) => ({ ...current, session: editSession(current.session, next, Date.now()) }));
  }, []);
  const undo = useCallback(() => {
    patchEditor((current) => ({ ...current, session: undoSession(current.session) }));
  }, []);
  const redo = useCallback(() => {
    patchEditor((current) => ({ ...current, session: redoSession(current.session) }));
  }, []);
  const discard = useCallback(() => {
    patchEditor((current) => ({ ...current, session: discardSession(current.session, Date.now()) }));
  }, []);
  const keepOwn = useCallback((path: string) => {
    patchEditor((current) => ({ ...current, session: keepMine(current.session, path) }));
  }, []);
  const takeServer = useCallback((path: string) => {
    patchEditor((current) => ({ ...current, session: takeTheirs(current.session, path, Date.now()) }));
  }, []);
  const setView = useCallback((patch: Partial<EditorView>) => {
    patchEditor((current) => ({ ...current, view: { ...current.view, ...patch } }));
  }, []);
  const save = useCallback(() => {
    const current = readEditor();
    if (current === null || current.sent !== null) return;
    const { saved, draft: sent } = current.session;
    writeEditor({ ...current, sent });
    void saveTheme({
      files: changedPaths(saved, sent).map((path) => ({ path, text: sent.files[path] })),
      remove: removedPaths(saved, sent),
      meta: sent.meta,
    })
      .then(() => fetchFiles())
      .then((fresh) =>
        patchEditor((latest) => ({
          ...latest,
          sent: null,
          session: adoptSaved(latest.session, savedDraftOf(fresh), sent, Date.now()),
        }))
      )
      .catch(() => patchEditor((latest) => ({ ...latest, sent: null, checked: {} })));
  }, [saveTheme, fetchFiles]);

  return useMemo(() => {
    if (state === null) return null;
    return {
      draft: state.session.draft,
      saved: state.session.saved,
      dirty,
      restoredAt: state.session.restoredAt,
      conflicts: state.session.conflicts,
      broken: brokenPaths(state.session.draft, state.checked),
      checked: state.checked,
      canUndo: canUndo(state.session.undo),
      canRedo: canRedo(state.session.undo),
      saving,
      previewing,
      view: state.view,
      change,
      undo,
      redo,
      discard,
      save,
      keepMine: keepOwn,
      takeTheirs: takeServer,
      setView,
      startPreview,
      stopPreview,
    };
  }, [
    state,
    dirty,
    saving,
    previewing,
    change,
    undo,
    redo,
    discard,
    save,
    keepOwn,
    takeServer,
    setView,
    startPreview,
    stopPreview,
  ]);
}
