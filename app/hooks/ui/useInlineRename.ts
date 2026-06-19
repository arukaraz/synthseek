"use client";

import { useCallback, useState } from "react";

import type { UseInlineRenameOptions, UseInlineRenameResult } from "./types";

export function useInlineRename({ value, onSave }: UseInlineRenameOptions): UseInlineRenameResult {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const start = useCallback(() => {
    setDraft(value);
    setIsEditing(true);
  }, [value]);

  const cancel = useCallback(() => setIsEditing(false), []);

  const save = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed.length === 0 || trimmed === value) {
      setIsEditing(false);
      return;
    }
    onSave(trimmed);
    setIsEditing(false);
  }, [draft, value, onSave]);

  return { isEditing, draft, setDraft, start, save, cancel };
}
