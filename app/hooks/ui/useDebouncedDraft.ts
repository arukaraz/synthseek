"use client";

import { useEffect, useRef, useState } from "react";

import { DRAFT_DEBOUNCE_MS } from "./constants";
import { useDebounce } from "./useDebounce";

export function useDebouncedDraft(
  value: string,
  onCommit: (next: string) => void,
  delay: number = DRAFT_DEBOUNCE_MS
): [string, (next: string) => void] {
  const [draft, setDraft] = useState(value);
  const committed = useRef(value);
  const commitRef = useRef(onCommit);
  const debounced = useDebounce(draft, { delay });

  useEffect(() => {
    commitRef.current = onCommit;
  }, [onCommit]);

  useEffect(() => {
    if (value === committed.current) return;
    committed.current = value;
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (debounced !== draft) return;
    if (debounced === committed.current) return;
    committed.current = debounced;
    commitRef.current(debounced);
  }, [debounced, draft]);

  return [draft, setDraft];
}
