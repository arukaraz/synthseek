import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePlayPauseShortcut } from "../usePlayPauseShortcut";

function mount(html: string): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.appendChild(host);
  return host;
}

function pressSpace(target: Element, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key: " ", code: "Space", bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("usePlayPauseShortcut", () => {
  it("toggles playback on Space wherever the page has focus, and keeps the focused button from firing", () => {
    const togglePlay = vi.fn();
    renderHook(() => usePlayPauseShortcut(togglePlay));
    const button = mount("<button type='button'>Delete</button>").querySelector("button");
    if (button === null) throw new Error("no button");

    const onBody = pressSpace(document.body);
    const onButton = pressSpace(button);

    expect(togglePlay).toHaveBeenCalledTimes(2);
    expect(onBody.defaultPrevented).toBe(true);
    expect(onButton.defaultPrevented).toBe(true);
  });

  it("toggles on a checkbox or a slider, which take no typed text", () => {
    const togglePlay = vi.fn();
    renderHook(() => usePlayPauseShortcut(togglePlay));
    const host = mount("<input type='checkbox'><input type='range'>");

    host.querySelectorAll("input").forEach((input) => pressSpace(input));

    expect(togglePlay).toHaveBeenCalledTimes(2);
  });

  it("leaves Space to whatever takes typed text", () => {
    const togglePlay = vi.fn();
    renderHook(() => usePlayPauseShortcut(togglePlay));
    const host = mount(
      "<input type='text'><input type='search'><textarea></textarea><select><option>a</option></select><div contenteditable='true'></div><div role='combobox' tabindex='0'></div>"
    );

    const events = [...host.children].map((element) => pressSpace(element));

    expect(togglePlay).not.toHaveBeenCalled();
    expect(events.some((event) => event.defaultPrevented)).toBe(false);
  });

  it("leaves Space to a dialog, where it presses the focused button", () => {
    const togglePlay = vi.fn();
    renderHook(() => usePlayPauseShortcut(togglePlay));
    const button = mount("<div role='alertdialog'><button type='button'>Confirm</button></div>").querySelector(
      "button"
    );
    if (button === null) throw new Error("no button");

    pressSpace(button);

    expect(togglePlay).not.toHaveBeenCalled();
  });

  it("keeps the focused element's own Space handler from running, as a menu trigger or a card would open", () => {
    const togglePlay = vi.fn();
    const ownHandler = vi.fn();
    renderHook(() => usePlayPauseShortcut(togglePlay));
    const trigger = mount("<button type='button' aria-haspopup='menu'>Filter and sort</button>").querySelector(
      "button"
    );
    if (trigger === null) throw new Error("no trigger");
    trigger.addEventListener("keydown", ownHandler);

    pressSpace(trigger);

    expect(togglePlay).toHaveBeenCalledOnce();
    expect(ownHandler).not.toHaveBeenCalled();
  });

  it("leaves Space to an open menu or list, where it picks the option", () => {
    const togglePlay = vi.fn();
    renderHook(() => usePlayPauseShortcut(togglePlay));
    const host = mount(
      "<div role='menu'><div role='menuitemradio' tabindex='0'>Done</div></div><div role='listbox'><div role='option' tabindex='0'>A</div></div>"
    );

    host.querySelectorAll("[tabindex]").forEach((item) => pressSpace(item));

    expect(togglePlay).not.toHaveBeenCalled();
  });

  it("ignores a held key and a modifier", () => {
    const togglePlay = vi.fn();
    renderHook(() => usePlayPauseShortcut(togglePlay));

    pressSpace(document.body, { repeat: true });
    pressSpace(document.body, { ctrlKey: true });
    pressSpace(document.body, { metaKey: true });

    expect(togglePlay).not.toHaveBeenCalled();
  });

  it("does nothing with nothing to play, and stops listening when playback goes away", () => {
    const togglePlay = vi.fn();
    const { rerender } = renderHook(({ toggle }) => usePlayPauseShortcut(toggle), {
      initialProps: { toggle: null as (() => void) | null },
    });

    const idle = pressSpace(document.body);
    rerender({ toggle: togglePlay });
    pressSpace(document.body);
    rerender({ toggle: null });
    pressSpace(document.body);

    expect(idle.defaultPrevented).toBe(false);
    expect(togglePlay).toHaveBeenCalledTimes(1);
  });
});
