import { DIALOG_COMPANION_SELECTOR } from "./constants";
import type { DialogOutsideHandler } from "./types";

export function keepOpenForCompanions(handler: DialogOutsideHandler | undefined): DialogOutsideHandler {
  return (event) => {
    handler?.(event);
    if (event.target instanceof Element && event.target.closest(DIALOG_COMPANION_SELECTOR) !== null) {
      event.preventDefault();
    }
  };
}
