import { useEffect, useRef } from "react";

import { isPlayPauseShortcut } from "./helpers";

export function usePlayPauseShortcut(togglePlay: (() => void) | null): void {
  const latest = useRef(togglePlay);
  latest.current = togglePlay;
  const enabled = togglePlay !== null;

  useEffect(() => {
    if (!enabled) return;
    const handler = (event: KeyboardEvent) => {
      if (!isPlayPauseShortcut(event)) return;
      event.preventDefault();
      event.stopPropagation();
      latest.current?.();
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true });
  }, [enabled]);
}
