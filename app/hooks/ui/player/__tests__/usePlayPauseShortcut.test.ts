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

  it("ignores a held key, a modifier, and a Space another handler already took", () => {
    const togglePlay = vi.fn();
    renderHook(() => usePlayPauseShortcut(togglePlay));
    const taken = mount("<div tabindex='0'></div>").firstElementChild;
    if (taken === null) throw new Error("no element");
    taken.addEventListener("keydown", (event) => event.preventDefault());

    pressSpace(document.body, { repeat: true });
    pressSpace(document.body, { ctrlKey: true });
    pressSpace(taken);

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
