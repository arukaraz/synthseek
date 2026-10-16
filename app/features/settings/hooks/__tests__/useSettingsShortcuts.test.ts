import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import { useSettingsShortcuts } from "../useSettingsShortcuts";

function press(init: KeyboardEventInit, target: EventTarget = document.body): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

function setup() {
  const onPalette = vi.fn();
  const onSearch = vi.fn();
  const hook = renderHook((handlers) => useSettingsShortcuts(handlers), { initialProps: { onPalette, onSearch } });
  return { onPalette, onSearch, hook };
}

function field(tag: "input" | "textarea", type?: string): HTMLElement {
  const element = document.createElement(tag);
  if (type && element instanceof HTMLInputElement) element.type = type;
  document.body.append(element);
  return element;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useSettingsShortcuts", () => {
  it.each([
    ["Ctrl+K", { key: "k", ctrlKey: true }],
    ["Cmd+K", { key: "k", metaKey: true }],
    ["Ctrl+Shift+K", { key: "K", ctrlKey: true, shiftKey: true }],
  ])("opens the palette on %s and claims the key", (_name, init) => {
    const { onPalette, onSearch } = setup();
    const event = press(init);
    expect(onPalette).toHaveBeenCalledOnce();
    expect(onSearch).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it("opens the palette even while typing in a field", () => {
    const { onPalette } = setup();
    press({ key: "k", ctrlKey: true }, field("input"));
    expect(onPalette).toHaveBeenCalledOnce();
  });

  it("ignores a plain k", () => {
    const { onPalette } = setup();
    expect(press({ key: "k" }).defaultPrevented).toBe(false);
    expect(onPalette).not.toHaveBeenCalled();
  });

  it("focuses the search on / outside a text field", () => {
    const { onSearch, onPalette } = setup();
    const event = press({ key: "/" });
    expect(onSearch).toHaveBeenCalledOnce();
    expect(onPalette).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it("focuses the search on / from a checkbox, which takes no text", () => {
    const { onSearch } = setup();
    press({ key: "/" }, field("input", "checkbox"));
    expect(onSearch).toHaveBeenCalledOnce();
  });

  it.each([
    ["a text input", () => field("input")],
    ["a textarea", () => field("textarea")],
  ])("lets / be typed into %s", (_name, make) => {
    const { onSearch } = setup();
    const event = press({ key: "/" }, make());
    expect(onSearch).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it.each([
    ["with Ctrl", { key: "/", ctrlKey: true }],
    ["with Cmd", { key: "/", metaKey: true }],
    ["with Alt", { key: "/", altKey: true }],
    ["on key repeat", { key: "/", repeat: true }],
  ])("ignores / %s", (_name, init) => {
    const { onSearch } = setup();
    press(init);
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("ignores Alt+Ctrl+K and a repeated Ctrl+K", () => {
    const { onPalette } = setup();
    press({ key: "k", ctrlKey: true, altKey: true });
    press({ key: "k", ctrlKey: true, repeat: true });
    expect(onPalette).not.toHaveBeenCalled();
  });

  it("ignores a key another handler already claimed", () => {
    const { onSearch } = setup();
    const claim = (event: Event) => event.preventDefault();
    document.body.addEventListener("keydown", claim);
    press({ key: "/" });
    document.body.removeEventListener("keydown", claim);
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("calls the latest handlers after a rerender", () => {
    const { onPalette, onSearch, hook } = setup();
    const nextPalette = vi.fn();
    hook.rerender({ onPalette: nextPalette, onSearch });
    press({ key: "k", ctrlKey: true });
    expect(nextPalette).toHaveBeenCalledOnce();
    expect(onPalette).not.toHaveBeenCalled();
  });

  it("stops listening once unmounted", () => {
    const { onPalette, hook } = setup();
    hook.unmount();
    const event = press({ key: "k", ctrlKey: true });
    expect(onPalette).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});
