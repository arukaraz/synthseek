import { useRef } from "react";

import { focusedControl } from "./helpers";
import type { DialogAutoFocusHandler, DialogOpenerFocus } from "./types";

export function useOpenerFocus(
  onOpenAutoFocus: DialogAutoFocusHandler | undefined,
  onCloseAutoFocus: DialogAutoFocusHandler | undefined
): DialogOpenerFocus {
  const openerRef = useRef<HTMLElement | null>(null);

  return {
    onOpenAutoFocus: (event) => {
      openerRef.current = focusedControl();
      onOpenAutoFocus?.(event);
    },
    onCloseAutoFocus: (event) => {
      onCloseAutoFocus?.(event);
      if (event.defaultPrevented) return;
      const opener = openerRef.current;
      if (opener === null || !opener.isConnected) return;
      event.preventDefault();
      opener.focus();
    },
  };
}
