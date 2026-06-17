"use client";

import { useCallback, useEffect, useState } from "react";

import type { DetailTarget } from "../types";

interface UseContentDetailArgs {
  open: boolean;
  target: DetailTarget | null;
}

export function useContentDetail({ open, target }: UseContentDetailArgs) {
  const [stack, setStack] = useState<DetailTarget[]>([]);

  useEffect(() => {
    if (open && target) {
      setStack([target]);
    }
  }, [open, target]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const current = stack.length > 0 ? stack[stack.length - 1] : null;
  const previous = stack.length > 1 ? stack[stack.length - 2] : null;
  const canGoBack = stack.length > 1;

  const navigateTo = useCallback((next: DetailTarget) => {
    setStack((prev) => [...prev, next]);
  }, []);

  const goBack = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const handleOpenChange = useCallback((nextOpen: boolean, onClose: () => void) => {
    if (nextOpen) return;
    setStack([]);
    onClose();
  }, []);

  return {
    current,
    previous,
    canGoBack,
    navigateTo,
    goBack,
    handleOpenChange,
  };
}
