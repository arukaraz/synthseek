import { afterEach, describe, expect, it, vi } from "vitest";

import { DIALOG_COMPANION_ATTRIBUTE } from "../constants";
import { keepOpenForCompanions } from "../helpers";
import type { DialogOutsideHandler } from "../types";

type OutsideEvent = Parameters<DialogOutsideHandler>[0];

function outsideEventOn(target: Element): OutsideEvent {
  const event: OutsideEvent = new CustomEvent("dismissableLayer.pointerDownOutside", {
    cancelable: true,
    detail: { originalEvent: new PointerEvent("pointerdown") },
  });
  Object.defineProperty(event, "target", { value: target });
  return event;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("keepOpenForCompanions", () => {
  it("keeps the dialog open when the press lands on a toast, so its action can run", () => {
    document.body.innerHTML = `<ol data-sonner-toaster><li><button>Undo</button></li></ol>`;
    const event = outsideEventOn(document.querySelector("button") ?? document.body);

    keepOpenForCompanions(undefined)(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("keeps the dialog open when the press lands on a layer that lives beside dialogs", () => {
    document.body.innerHTML = `<div ${DIALOG_COMPANION_ATTRIBUTE}=""><button>Minimize</button></div>`;
    const event = outsideEventOn(document.querySelector("button") ?? document.body);

    keepOpenForCompanions(undefined)(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("lets any other outside press close the dialog", () => {
    document.body.innerHTML = `<main><button>Elsewhere</button></main>`;
    const event = outsideEventOn(document.querySelector("button") ?? document.body);

    keepOpenForCompanions(undefined)(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it("still calls the handler the dialog was given", () => {
    document.body.innerHTML = `<main><button>Elsewhere</button></main>`;
    const handler = vi.fn();
    const event = outsideEventOn(document.querySelector("button") ?? document.body);

    keepOpenForCompanions(handler)(event);

    expect(handler).toHaveBeenCalledWith(event);
  });
});
