import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { TapToOpenResult, TapToOpenTriggerProps, UseTapToOpenOptions } from "./types";

const DEFAULT_MOVE_THRESHOLD = 10;
const DEFAULT_TAP_TIMEOUT = 700;

function isTouchPointer(event: ReactPointerEvent): boolean {
  return event.pointerType === "touch" || event.pointerType === "pen";
}

export function useTapToOpen(options: UseTapToOpenOptions = {}): TapToOpenResult {
  const { moveThreshold = DEFAULT_MOVE_THRESHOLD, tapTimeout = DEFAULT_TAP_TIMEOUT } = options;
  const [open, setOpen] = useState(false);
  const start = useRef<{ x: number; y: number; time: number } | null>(null);

  const onPointerDown = (event: ReactPointerEvent) => {
    if (!isTouchPointer(event)) {
      start.current = null;
      return;
    }
    start.current = { x: event.clientX, y: event.clientY, time: event.timeStamp };
    event.preventDefault();
  };

  const onPointerUp = (event: ReactPointerEvent) => {
    if (!isTouchPointer(event)) return;
    const origin = start.current;
    start.current = null;
    if (!origin) return;
    const movedX = Math.abs(event.clientX - origin.x);
    const movedY = Math.abs(event.clientY - origin.y);
    const elapsed = event.timeStamp - origin.time;
    if (movedX <= moveThreshold && movedY <= moveThreshold && elapsed <= tapTimeout) {
      setOpen((prev) => !prev);
    }
  };

  const onPointerCancel = () => {
    start.current = null;
  };

  const triggerProps: TapToOpenTriggerProps = { onPointerDown, onPointerUp, onPointerCancel };

  return { open, setOpen, onOpenChange: setOpen, triggerProps };
}
