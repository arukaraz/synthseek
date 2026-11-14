"use client";

import { useCallback, useEffect, useState } from "react";

import type { DetailTarget } from "../types";

interface UseContentDetailArgs {
  open: boolean;
  target: DetailTarget | null;
  session?: number;
}

interface DetailStack {
  session: number | undefined;
  items: DetailTarget[];
}

export function useContentDetail({ open, target, session }: UseContentDetailArgs) {
  const [stack, setStack] = useState<DetailStack>({ session: undefined, items: [] });

  useEffect(() => {
    if (open && target) {
      setStack((prev) =>
        session !== undefined && prev.session === session && prev.items.length > 0 ? prev : { session, items: [target] }
      );
    }
  }, [open, target, session]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const items = stack.items;
  const current = items.length > 0 ? items[items.length - 1] : null;
  const previous = items.length > 1 ? items[items.length - 2] : null;
  const canGoBack = items.length > 1;

  const navigateTo = useCallback((next: DetailTarget) => {
    setStack((prev) => ({ ...prev, items: [...prev.items, next] }));
  }, []);

  const goBack = useCallback(() => {
    setStack((prev) => (prev.items.length > 1 ? { ...prev, items: prev.items.slice(0, -1) } : prev));
  }, []);

  const handleOpenChange = useCallback((nextOpen: boolean, onClose: () => void) => {
    if (nextOpen) return;
    setStack((prev) => ({ ...prev, items: [] }));
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
