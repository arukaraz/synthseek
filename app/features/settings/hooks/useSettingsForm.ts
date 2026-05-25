"use client";

import { useEffect, useState } from "react";

export function useSettingsForm<T extends object>(initial: T | undefined) {
  const [draft, setDraft] = useState<T | null>(initial ?? null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!initial) return;
    setDraft((current) => (current === null ? initial : current));
  }, [initial]);

  const isDirty = draft !== null && initial !== undefined && JSON.stringify(draft) !== JSON.stringify(initial);

  const setField = <K extends keyof T>(key: K, value: T[K]) => {
    setDraft((prev) => (prev === null ? prev : { ...prev, [key]: value }));
  };

  const reset = () => {
    if (initial) setDraft(initial);
  };

  const save = async (mutator: (payload: T) => Promise<unknown>) => {
    if (draft === null) return;
    setIsSaving(true);
    try {
      await mutator(draft);
    } finally {
      setIsSaving(false);
    }
  };

  return { draft, setField, reset, save, isDirty, isSaving };
}
