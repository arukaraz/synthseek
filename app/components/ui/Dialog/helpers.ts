import { TOASTER_SELECTOR } from "./constants";
import type { DialogOutsideHandler } from "./types";

export function keepOpenForToasts(handler: DialogOutsideHandler | undefined): DialogOutsideHandler {
  return (event) => {
    handler?.(event);
    if (event.target instanceof Element && event.target.closest(TOASTER_SELECTOR) !== null) event.preventDefault();
  };
}
