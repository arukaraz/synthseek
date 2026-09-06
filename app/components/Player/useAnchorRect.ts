"use client";

import { useEffect, useState } from "react";

import { PANEL_ANCHOR_GAP_PX, PANEL_VIEWPORT_MARGIN_PX, PANEL_WIDTH_PX } from "./constants";
import type { PanelAnchorPoint } from "./types";

export function useAnchorRect(selector: string, enabled: boolean): PanelAnchorPoint | null {
  const [point, setPoint] = useState<PanelAnchorPoint | null>(null);

  useEffect(() => {
    if (!enabled) {
      setPoint(null);
      return;
    }
    const measure = () => {
      const toggle = document.querySelector(selector);
      if (toggle === null) {
        setPoint(null);
        return;
      }
      const rect = toggle.getBoundingClientRect();
      const maxLeft = window.innerWidth - PANEL_WIDTH_PX - PANEL_VIEWPORT_MARGIN_PX;
      setPoint({
        top: Math.round(rect.bottom + PANEL_ANCHOR_GAP_PX),
        left: Math.round(Math.max(PANEL_VIEWPORT_MARGIN_PX, Math.min(rect.left, maxLeft))),
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
    };
  }, [selector, enabled]);

  return point;
}
