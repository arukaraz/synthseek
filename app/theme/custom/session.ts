import { changedPaths, isTokenPath, removedPaths, sameDraft } from "./draft";
import { mergeTokenFile, withoutDiscarded } from "./merge";
import { storedDraftSchema, themeDraftSchema } from "./schema";
import type { DraftBase, EditorSession, FollowedDraft, StoredDraft, ThemeDraft, ThemeMeta, UndoLog } from "./types";
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

function textOf(draft: ThemeDraft, path: string): string | null {
  return Object.hasOwn(draft.files, path) ? draft.files[path] : null;
}

function withText(files: Record<string, string>, path: string, text: string | null): void {
  if (text === null) delete files[path];
  else files[path] = text;
}

function touchedPaths(saved: ThemeDraft, draft: ThemeDraft): string[] {
  return [...changedPaths(saved, draft), ...removedPaths(saved, draft)];
}

function baseOf(saved: ThemeDraft, draft: ThemeDraft): DraftBase {
  const files: Record<string, string | null> = {};
  for (const path of touchedPaths(saved, draft)) files[path] = textOf(saved, path);
  return { meta: saved.meta, files };
}

function savedUnder(base: DraftBase, draft: ThemeDraft): ThemeDraft {
  const files = { ...draft.files };
  for (const [path, text] of Object.entries(base.files)) withText(files, path, text);
  return { meta: base.meta, files };
}

export function serializeStoredDraft(draft: ThemeDraft, saved: ThemeDraft, at: number): string {
  return JSON.stringify({ at, draft, base: baseOf(saved, draft) });
}

export function isDirty(session: EditorSession): boolean {
  return !sameDraft(session.saved, session.draft);
}

function followedSet(base: readonly string[], theirs: readonly string[], mine: string[]): string[] {
  const before = new Set(base);
  const after = new Set(theirs);
  const own = new Set(mine);
  const kept = mine.filter((name) => !before.has(name) || after.has(name));
  const added = theirs.filter((name) => !before.has(name) && !own.has(name));
  return kept.length === mine.length && added.length === 0 ? mine : [...kept, ...added];
}

function followedMeta(base: ThemeMeta, theirs: ThemeMeta, mine: ThemeMeta): ThemeMeta {
  const name = mine.name === base.name ? theirs.name : mine.name;
  const scheme = mine.scheme === base.scheme ? theirs.scheme : mine.scheme;
  const startedFrom = mine.startedFrom === base.startedFrom ? theirs.startedFrom : mine.startedFrom;
  const follows = followedSet(base.follows, theirs.follows, mine.follows);
  const unmoved =
    name === mine.name && scheme === mine.scheme && startedFrom === mine.startedFrom && follows === mine.follows;
  return unmoved ? mine : { name, scheme, startedFrom, follows };
}

function follow(base: ThemeDraft, theirs: ThemeDraft, mine: ThemeDraft): FollowedDraft {
  const files = { ...mine.files };
  const conflicts: string[] = [];
  let moved = false;
  for (const path of new Set([...Object.keys(base.files), ...Object.keys(theirs.files)])) {
    const before = textOf(base, path);
    const after = textOf(theirs, path);
    const own = textOf(mine, path);
    if (before === after || own === after) continue;
    if (own === before) {
      withText(files, path, after);
      moved = true;
      continue;
    }
    const mergeable = isTokenPath(path) && before !== null && after !== null && own !== null;
    const merged = mergeable ? mergeTokenFile(before, after, own) : null;
    if (merged === null || merged.clash) conflicts.push(path);
    if (merged === null || merged.text === own) continue;
    files[path] = merged.text;
    moved = true;
  }
  const meta = followedMeta(base.meta, theirs.meta, mine.meta);
  const draft = moved || meta !== mine.meta ? { meta, files } : mine;
  return { draft, conflicts: conflicts.sort() };
}

function keptDraft(saved: ThemeDraft, stored: StoredDraft): FollowedDraft {
  if (stored.base === undefined) return { draft: stored.draft, conflicts: [] };
  return follow(savedUnder(stored.base, stored.draft), saved, stored.draft);
}

export function openSession(saved: ThemeDraft, stored: StoredDraft | null): EditorSession {
  const kept = stored === null ? null : keptDraft(saved, stored);
  const restored = stored !== null && kept !== null && !sameDraft(kept.draft, saved);
  const draft = restored ? kept.draft : saved;
  return {
    saved,
    draft,
    undo: recordSnapshot(emptyUndoLog(), serializeDraft(draft), 0),
    restoredAt: restored ? stored.at : null,
    conflicts: restored ? kept.conflicts : [],
  };
}

export function editSession(session: EditorSession, draft: ThemeDraft, now: number): EditorSession {
  return { ...session, draft, undo: recordSnapshot(session.undo, serializeDraft(draft), now) };
}

function unsettled(conflicts: readonly string[], saved: ThemeDraft, draft: ThemeDraft): string[] {
  return conflicts.filter((path) => textOf(draft, path) !== textOf(saved, path));
}

function stepped(session: EditorSession, step: ReturnType<typeof undoStep>): EditorSession {
  if (step === null) return session;
  const draft = parseDraft(step.snapshot);
  if (draft === null) return session;
  return { ...session, draft, undo: step.log, conflicts: unsettled(session.conflicts, session.saved, draft) };
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

function landedOf(before: ThemeDraft, sent: ThemeDraft, saved: ThemeDraft): ThemeDraft {
  const files = { ...saved.files };
  for (const path of touchedPaths(before, sent)) withText(files, path, textOf(sent, path));
  return { meta: saved.meta, files };
}

function carriedLog(log: UndoLog, current: ThemeDraft, carry: (draft: ThemeDraft) => ThemeDraft): UndoLog {
  const carried = (snapshots: readonly string[]) =>
    snapshots.flatMap((snapshot) => {
      const draft = parseDraft(snapshot);
      return draft === null ? [] : [carry(draft)];
    });
  const before = carried(log.past);
  const steps = [...before, current, ...carried(log.future)];
  const here = before.length;
  const past = before.filter((draft, index) => !sameDraft(draft, steps[index + 1]));
  const future = steps.slice(here + 1).filter((draft, index) => !sameDraft(draft, steps[here + index]));
  return {
    past: past.map(serializeDraft),
    future: future.map(serializeDraft),
    last: serializeDraft(current),
    at: log.at,
  };
}

export function adoptSaved(
  session: EditorSession,
  saved: ThemeDraft,
  sent: ThemeDraft | null,
  now: number
): EditorSession {
  const base = sent ?? session.saved;
  const landed = sent === null ? saved : landedOf(session.saved, sent, saved);
  const elsewhere = follow(base, landed, session.draft);
  const cleaned = follow(landed, saved, elsewhere.draft);
  const settled = sameDraft(cleaned.draft, saved);
  const draft = settled && cleaned.draft !== session.draft ? saved : cleaned.draft;
  const carried = sameDraft(base, landed)
    ? session.undo
    : carriedLog(session.undo, elsewhere.draft, (snapshot) => follow(base, landed, snapshot).draft);
  const undo = sameDraft(elsewhere.draft, draft) ? carried : recordSnapshot(carried, serializeDraft(draft), now);
  const conflicts = new Set([...session.conflicts, ...elsewhere.conflicts, ...cleaned.conflicts]);
  return {
    saved,
    draft,
    undo,
    restoredAt: settled || sent !== null ? null : session.restoredAt,
    conflicts: unsettled([...conflicts].sort(), saved, draft),
  };
}

export function keepMine(session: EditorSession, path: string): EditorSession {
  return { ...session, conflicts: session.conflicts.filter((conflict) => conflict !== path) };
}

export function takeTheirs(session: EditorSession, path: string, now: number): EditorSession {
  const files = { ...session.draft.files };
  withText(files, path, textOf(session.saved, path));
  const loaded = { ...session.draft, files };
  const draft = isTokenPath(path) ? withoutDiscarded(session.draft, loaded, session.saved, path) : loaded;
  const settled = keepMine(editSession(session, draft, now), path);
  return { ...settled, conflicts: unsettled(settled.conflicts, settled.saved, settled.draft) };
}
