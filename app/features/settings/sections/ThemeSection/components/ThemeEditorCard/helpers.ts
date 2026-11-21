import { draftValues, parseColor, relativeLuminance } from "@theme/custom";
import type { ThemeDraft } from "@theme/custom";

import type { ThemeEditor } from "../../types";
import { DARK_SURFACE_LUMINANCE, NON_TEXT_INPUT_TYPES, SURFACE_TOKEN, UNDO_KEY } from "./constants";
import type { BarStatus, SchemeMismatch, UndoKeyEvent } from "./types";

export function schemeMismatchOf(draft: ThemeDraft): SchemeMismatch | null {
  const value = draftValues(draft).get(SURFACE_TOKEN);
  const surface = value === undefined ? null : parseColor(value);
  if (surface === null) return null;
  const darkSurfaces = relativeLuminance(surface) < DARK_SURFACE_LUMINANCE;
  if (draft.meta.scheme === "light" && darkSurfaces) return "lightOverDark";
  if (draft.meta.scheme === "dark" && !darkSurfaces) return "darkOverLight";
  return null;
}

export function unseenConflictsOf(editor: Pick<ThemeEditor, "conflicts" | "view" | "draft">): string[] {
  const { view, draft } = editor;
  const open = view.mode === "css" && Object.hasOwn(draft.files, view.file) ? view.file : null;
  return editor.conflicts.filter((path) => path !== open);
}

export function barStatusOf(editor: Pick<ThemeEditor, "broken" | "saving" | "dirty">): BarStatus {
  if (editor.broken.length > 0) return { kind: "broken", file: editor.broken[0], others: editor.broken.length - 1 };
  if (editor.saving) return { kind: "saving" };
  if (editor.dirty) return { kind: "unsaved" };
  return { kind: "saved" };
}

export function canSaveTheme(editor: Pick<ThemeEditor, "broken" | "saving" | "dirty">): boolean {
  return editor.dirty && !editor.saving && editor.broken.length === 0;
}

export function isUndoShortcut(event: UndoKeyEvent): boolean {
  return (event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === UNDO_KEY;
}

export function isOwnUndoField(target: EventTarget | null): boolean {
  if (target instanceof HTMLTextAreaElement) return true;
  return target instanceof HTMLInputElement && !NON_TEXT_INPUT_TYPES.includes(target.type);
}
