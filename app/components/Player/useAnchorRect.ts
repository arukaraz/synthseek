"use client";

import { useEffect, useState } from "react";

import { HEADER_SLOT_QUERY, PANEL_ANCHOR_GAP_PX, PANEL_VIEWPORT_MARGIN_PX, PANEL_WIDTH_PX } from "./constants";
import { visibleMatch } from "./helpers";
import type { PanelAnchorPoint } from "./types";

export function useAnchorRect(selector: string, enabled: boolean): PanelAnchorPoint | null {
  const [point, setPoint] = useState<PanelAnchorPoint | null>(null);

  useEffect(() => {
    if (!enabled) {
      setPoint(null);
      return;
    }
    const wide = window.matchMedia(HEADER_SLOT_QUERY);
    const measure = () => {
      const toggle = visibleMatch(selector);
      if (toggle === null || !wide.matches) {
        setPoint(null);
        return;
      }
      const rect = toggle.getBoundingClientRect();
      const maxLeft = window.innerWidth - PANEL_WIDTH_PX - PANEL_VIEWPORT_MARGIN_PX;
      const below = rect.top < window.innerHeight / 2;
      setPoint({
        top: Math.round(rect.bottom + PANEL_ANCHOR_GAP_PX),
        bottom: Math.round(window.innerHeight - rect.top + PANEL_ANCHOR_GAP_PX),
        left: Math.round(Math.max(PANEL_VIEWPORT_MARGIN_PX, Math.min(rect.left, maxLeft))),
        below,
        room: Math.round(below ? window.innerHeight - rect.bottom : rect.top) - PANEL_ANCHOR_GAP_PX * 2,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    wide.addEventListener("change", measure);
    return () => {
      window.removeEventListener("resize", measure);
      wide.removeEventListener("change", measure);
    };
  }, [selector, enabled]);

  return point;
}
