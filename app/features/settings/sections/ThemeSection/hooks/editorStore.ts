import type { EditorState } from "../types";

const listeners = new Set<() => void>();

let state: EditorState | null = null;

export function readEditor(): EditorState | null {
  return state;
}

export function writeEditor(next: EditorState | null): void {
  state = next;
  listeners.forEach((listener) => listener());
}

export function patchEditor(patch: (current: EditorState) => EditorState): void {
  if (state !== null) writeEditor(patch(state));
}

export function subscribeEditor(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function noEditor(): null {
  return null;
}
