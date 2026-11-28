import { DIALOG_COMPANION_SELECTOR, MENU_SELECTOR } from "./constants";
import type { DialogOutsideHandler } from "./types";

function openerOfMenu(control: HTMLElement): HTMLElement {
  const labelledBy = control.closest(MENU_SELECTOR)?.getAttribute("aria-labelledby");
  const opener = labelledBy ? document.getElementById(labelledBy) : null;
  return opener === null || opener === control ? control : openerOfMenu(opener);
}

export function focusedControl(): HTMLElement | null {
  const active = document.activeElement;
  return active instanceof HTMLElement && active !== document.body ? openerOfMenu(active) : null;
}

export function keepOpenForCompanions(handler: DialogOutsideHandler | undefined): DialogOutsideHandler {
  return (event) => {
    handler?.(event);
    if (event.target instanceof Element && event.target.closest(DIALOG_COMPANION_SELECTOR) !== null) {
      event.preventDefault();
    }
  };
}
