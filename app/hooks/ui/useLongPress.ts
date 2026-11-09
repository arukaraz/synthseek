"use client";

import { useEffect, useRef } from "react";

import { LONG_PRESS_MS, LONG_PRESS_SLOP_PX } from "./constants";
import { startsLongPress, swallowNextClick } from "./helpers";
import type { LongPressHandlers } from "./types";

export function useLongPress(onHold: (() => void) | undefined): LongPressHandlers {
  const hold = useRef(onHold);
  const timer = useRef<number | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const held = useRef(false);

  useEffect(() => {
    hold.current = onHold;
  });

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    []
  );

  const cancel = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    origin.current = null;
  };

  return {
    onPointerDown: (event) => {
      held.current = false;
      cancel();
      if (hold.current === undefined || event.pointerType === "mouse") return;
      if (!startsLongPress(event.target, event.currentTarget)) return;
      origin.current = { x: event.clientX, y: event.clientY };
      timer.current = window.setTimeout(() => {
        timer.current = null;
        origin.current = null;
        held.current = true;
        swallowNextClick();
        hold.current?.();
      }, LONG_PRESS_MS);
    },
    onPointerMove: (event) => {
      const start = origin.current;
      if (start === null) return;
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > LONG_PRESS_SLOP_PX) cancel();
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onContextMenu: (event) => {
      if (held.current || timer.current !== null) event.preventDefault();
    },
  };
}
