"use client";

import { useCallback, useEffect, useRef } from "react";

import { SHEET_DRAG } from "./constants";
import { canStartSheetDrag } from "./helpers";
import type { SheetDragPhase, UseSheetDragOptions } from "./types";

export function useSheetDrag({ onDismiss, enabled = true }: UseSheetDragOptions) {
  const dismissRef = useRef(onDismiss);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    dismissRef.current = onDismiss;
    enabledRef.current = enabled;
  }, [onDismiss, enabled]);

  return useCallback((node: HTMLElement | null) => {
    if (!node) return undefined;
    let phase: SheetDragPhase = "idle";
    let startX = 0;
    let startY = 0;
    let offset = 0;
    let lastY = 0;
    let lastTime = 0;
    let velocity = 0;
    let dismissTimer: number | undefined;

    const onStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!enabledRef.current || !touch || event.touches.length > 1) {
        phase = "ignore";
        return;
      }
      phase = canStartSheetDrag(event.target, node) ? "pending" : "ignore";
      startX = touch.clientX;
      startY = touch.clientY;
      lastY = touch.clientY;
      lastTime = event.timeStamp;
      offset = 0;
      velocity = 0;
    };

    const onMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch || phase === "idle" || phase === "ignore") return;
      const deltaY = touch.clientY - startY;
      const deltaX = touch.clientX - startX;
      if (phase === "pending") {
        if (Math.abs(deltaY) < SHEET_DRAG.AXIS_LOCK_PX && Math.abs(deltaX) < SHEET_DRAG.AXIS_LOCK_PX) return;
        if (deltaY <= 0 || Math.abs(deltaX) > Math.abs(deltaY)) {
          phase = "ignore";
          return;
        }
        phase = "drag";
        node.style.transition = "none";
      }
      event.preventDefault();
      const elapsed = event.timeStamp - lastTime;
      if (elapsed > 0) velocity = (touch.clientY - lastY) / elapsed;
      lastY = touch.clientY;
      lastTime = event.timeStamp;
      offset = Math.max(0, deltaY);
      node.style.transform = `translateY(${offset}px)`;
    };

    const onEnd = () => {
      if (phase !== "drag") {
        phase = "idle";
        return;
      }
      phase = "idle";
      const threshold = Math.min(SHEET_DRAG.DISMISS_DISTANCE_PX, node.offsetHeight * SHEET_DRAG.DISMISS_FRACTION);
      node.style.transition = `transform ${SHEET_DRAG.SETTLE_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1)`;
      if (offset > threshold || velocity > SHEET_DRAG.DISMISS_VELOCITY_PX_PER_MS) {
        node.style.transform = "translateY(100%)";
        node.style.animation = "none";
        dismissTimer = window.setTimeout(() => dismissRef.current(), SHEET_DRAG.SETTLE_MS);
        return;
      }
      node.style.transform = "";
    };

    node.addEventListener("touchstart", onStart, { passive: true });
    node.addEventListener("touchmove", onMove, { passive: false });
    node.addEventListener("touchend", onEnd);
    node.addEventListener("touchcancel", onEnd);
    return () => {
      window.clearTimeout(dismissTimer);
      node.removeEventListener("touchstart", onStart);
      node.removeEventListener("touchmove", onMove);
      node.removeEventListener("touchend", onEnd);
      node.removeEventListener("touchcancel", onEnd);
    };
  }, []);
}
