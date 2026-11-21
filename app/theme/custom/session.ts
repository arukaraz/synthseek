import { sameDraft } from "./draft";
import { storedDraftSchema, themeDraftSchema } from "./schema";
import type { EditorSession, StoredDraft, ThemeDraft } from "./types";
import { emptyUndoLog, recordSnapshot, redoStep, undoStep } from "./undo";

export function serializeDraft(draft: ThemeDraft): string {
  return JSON.stringify(draft);
}

function parsed(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function parseDraft(text: string): ThemeDraft | null {
  const result = themeDraftSchema.safeParse(parsed(text));
  return result.success ? result.data : null;
}

export function parseStoredDraft(text: string | null): StoredDraft | null {
  if (text === null) return null;
  const result = storedDraftSchema.safeParse(parsed(text));
  return result.success ? result.data : null;
}

export function serializeStoredDraft(draft: ThemeDraft, at: number): string {
  return JSON.stringify({ at, draft });
}

export function isDirty(session: EditorSession): boolean {
  return !sameDraft(session.saved, session.draft);
}

export function openSession(saved: ThemeDraft, stored: StoredDraft | null): EditorSession {
  const restored = stored !== null && !sameDraft(stored.draft, saved);
  const draft = restored ? stored.draft : saved;
  return {
    saved,
    draft,
    undo: recordSnapshot(emptyUndoLog(), serializeDraft(draft), 0),
    restoredAt: restored ? stored.at : null,
    conflicts: [],
  };
}

export function editSession(session: EditorSession, draft: ThemeDraft, now: number): EditorSession {
  return { ...session, draft, undo: recordSnapshot(session.undo, serializeDraft(draft), now) };
}

function stepped(session: EditorSession, step: ReturnType<typeof undoStep>): EditorSession {
  if (step === null) return session;
  const draft = parseDraft(step.snapshot);
  return draft === null ? session : { ...session, draft, undo: step.log, conflicts: [] };
}

export function undoSession(session: EditorSession): EditorSession {
  return stepped(session, undoStep(session.undo));
}

export function redoSession(session: EditorSession): EditorSession {
  return stepped(session, redoStep(session.undo));
}

export function discardSession(session: EditorSession, now: number): EditorSession {
  return { ...editSession(session, session.saved, now), restoredAt: null, conflicts: [] };
}

function textOf(draft: ThemeDraft, path: string): string | null {
  return Object.hasOwn(draft.files, path) ? draft.files[path] : null;
}

function changedOnServer(before: ThemeDraft, after: ThemeDraft, draft: ThemeDraft): string[] {
  const paths = new Set([...Object.keys(before.files), ...Object.keys(after.files)]);
  return [...paths]
    .filter((path) => textOf(before, path) !== textOf(after, path) && textOf(draft, path) !== textOf(after, path))
    .sort();
}

export function adoptSaved(
  session: EditorSession,
  saved: ThemeDraft,
  sent: ThemeDraft | null,
  now: number
): EditorSession {
  const untouchedSinceSave = sent !== null && sameDraft(session.draft, sent);
  if (untouchedSinceSave || !isDirty(session)) {
    const next = sameDraft(session.draft, saved) ? session : editSession(session, saved, now);
    return { ...next, saved, restoredAt: null, conflicts: [] };
  }
  const moved = changedOnServer(sent ?? session.saved, saved, session.draft);
  const conflicts = new Set([...session.conflicts, ...moved]);
  return { ...session, saved, restoredAt: sent === null ? session.restoredAt : null, conflicts: [...conflicts].sort() };
}

export function keepMine(session: EditorSession, path: string): EditorSession {
  return { ...session, conflicts: session.conflicts.filter((conflict) => conflict !== path) };
}

export function takeTheirs(session: EditorSession, path: string, now: number): EditorSession {
  const files = { ...session.draft.files };
  const theirs = textOf(session.saved, path);
  if (theirs === null) delete files[path];
  else files[path] = theirs;
  return keepMine(editSession(session, { ...session.draft, files }, now), path);
}
