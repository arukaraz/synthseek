"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useRangePreview() {
  const hoveredRef = useRef<string | null>(null);
  const [shiftHeld, setShiftHeld] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    const sync = (event: KeyboardEvent) => setShiftHeld(event.shiftKey);
    const release = () => setShiftHeld(false);

    window.addEventListener("keydown", sync);
    window.addEventListener("keyup", sync);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("keydown", sync);
      window.removeEventListener("keyup", sync);
      window.removeEventListener("blur", release);
    };
  }, []);

  useEffect(() => {
    setPreviewId(shiftHeld ? hoveredRef.current : null);
  }, [shiftHeld]);

  const trackRow = useCallback(
    (id: string | null) => {
      hoveredRef.current = id;
      setPreviewId(shiftHeld ? id : null);
    },
    [shiftHeld]
  );

  return { previewId, trackRow };
}
