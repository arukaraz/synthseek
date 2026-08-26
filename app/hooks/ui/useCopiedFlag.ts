"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const COPIED_DWELL_MS = 2000;

export function useCopiedFlag(): { copied: boolean; markCopied: () => void; resetCopied: () => void } {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) clearTimeout(timer.current);
    };
  }, []);

  const markCopied = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    setCopied(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setCopied(false);
    }, COPIED_DWELL_MS);
  }, []);

  const resetCopied = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    setCopied(false);
  }, []);

  return { copied, markCopied, resetCopied };
}
