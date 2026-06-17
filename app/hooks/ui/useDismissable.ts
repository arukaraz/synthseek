import { useCallback, useEffect, useRef, useState } from "react";

import type { UseDismissableResult } from "./types";

export function useDismissable<TElement extends HTMLElement>(): UseDismissableResult<TElement> {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<TElement | null>(null);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const node = containerRef.current;
      if (node && event.target instanceof Node && !node.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return { open, toggle, close, containerRef };
}
