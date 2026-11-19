"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { gridKeyOf, monthOf, moveGridFocus, sameMonth, selectedDayOf } from "../helpers";
import type { UseGridFocusInput } from "./types";

export function useGridFocus({ ref, firstDay, today, grid, onMonthChange }: UseGridFocusInput) {
  const [focusIso, setFocusIso] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pendingFocus = useRef(false);

  const activeIso = focusIso !== null && sameMonth(monthOf(focusIso), ref) ? focusIso : selectedDayOf(grid, today);

  useEffect(() => {
    if (!pendingFocus.current || activeIso === null) return;
    pendingFocus.current = false;
    containerRef.current?.querySelector<HTMLElement>(`[data-iso="${activeIso}"]`)?.focus();
  }, [activeIso, ref]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>, iso: string) => {
      const key = gridKeyOf(event.key);
      if (key === null) return;
      event.preventDefault();
      const next = moveGridFocus(iso, key, firstDay);
      pendingFocus.current = true;
      setFocusIso(next);
      const nextMonth = monthOf(next);
      if (!sameMonth(nextMonth, ref)) onMonthChange(nextMonth);
    },
    [firstDay, onMonthChange, ref]
  );

  return { containerRef, activeIso, onKeyDown, setFocusIso };
}
