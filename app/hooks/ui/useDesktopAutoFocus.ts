import { useEffect, type RefObject } from "react";

import { DESKTOP_AUTOFOCUS_QUERY } from "./constants";

export function useDesktopAutoFocus(target: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    if (window.matchMedia(DESKTOP_AUTOFOCUS_QUERY).matches) target.current?.focus();
  }, [target]);
}
