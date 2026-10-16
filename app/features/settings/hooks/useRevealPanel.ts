"use client";

import { useCallback, useRef } from "react";

import { PANEL_REVEAL_VIEWPORT_SHARE } from "../constants";

export function useRevealPanel() {
  const panelRef = useRef<HTMLElement>(null);

  const reveal = useCallback(() => {
    window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const { top } = panel.getBoundingClientRect();
      if (top >= 0 && top <= window.innerHeight * PANEL_REVEAL_VIEWPORT_SHARE) return;
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return { panelRef, reveal };
}
