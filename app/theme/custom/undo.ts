import { UNDO_GROUP_MS, UNDO_MAX_STEPS } from "./constants";
import type { UndoLog } from "./types";

export function emptyUndoLog(): UndoLog {
  return { past: [], future: [], last: null, at: 0 };
}

export function recordSnapshot(log: UndoLog, snapshot: string, now: number): UndoLog {
  if (log.last === null) return { ...log, last: snapshot, at: now };
  if (log.last === snapshot) return log;
  const startsStep = log.past.length === 0 || now - log.at > UNDO_GROUP_MS;
  const past = startsStep ? [...log.past, log.last].slice(-UNDO_MAX_STEPS) : log.past;
  return { past, future: [], last: snapshot, at: now };
}

export function undoStep(log: UndoLog): { log: UndoLog; snapshot: string } | null {
  const snapshot = log.past[log.past.length - 1];
  if (snapshot === undefined) return null;
  const future = log.last === null ? log.future : [log.last, ...log.future];
  return { log: { past: log.past.slice(0, -1), future, last: snapshot, at: 0 }, snapshot };
}

export function redoStep(log: UndoLog): { log: UndoLog; snapshot: string } | null {
  const snapshot = log.future[0];
  if (snapshot === undefined) return null;
  const past = log.last === null ? log.past : [...log.past, log.last];
  return { log: { past, future: log.future.slice(1), last: snapshot, at: 0 }, snapshot };
}

export function canUndo(log: UndoLog): boolean {
  return log.past.length > 0;
}

export function canRedo(log: UndoLog): boolean {
  return log.future.length > 0;
}
