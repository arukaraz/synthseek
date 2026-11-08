import { afterEach, describe, expect, it, vi } from "vitest";

import { fireEvent, renderWithProviders, screen, within } from "@test/test-utils";

import { AlphabetIndex } from "../AlphabetIndex";
import type { AlphabetIndexEntry } from "../types";

const A: AlphabetIndexEntry = { letter: "A", offset: 0 };
const D: AlphabetIndexEntry = { letter: "D", offset: 7 };
const SLOT_PX = 10;
const LETTERS = [..."#ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

function renderIndex(onSelect = vi.fn()) {
  renderWithProviders(
    <AlphabetIndex
      entries={[A, D]}
      letters={LETTERS}
      label="Jump to a letter"
      letterLabel={(letter) => `Jump to ${letter}`}
      onSelect={onSelect}
    />
  );
  const nav = screen.getByRole("navigation", { name: "Jump to a letter" });
  nav.setPointerCapture = vi.fn();
  nav.getBoundingClientRect = () => new DOMRect(0, 5, 28, 270);
  const strip = screen.getByRole("button", { name: "Jump to A" }).parentElement;
  if (!strip) throw new Error("strip missing");
  strip.getBoundingClientRect = () => new DOMRect(0, 0, 28, 27 * SLOT_PX);
  return { nav, onSelect };
}

function slotY(index: number): number {
  return index * SLOT_PX + SLOT_PX / 2;
}

function bubble(nav: HTMLElement): HTMLElement | null {
  return within(nav).queryByText(/^.$/, { selector: "span" });
}

describe("AlphabetIndex", () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, "vibrate");
  });

  it("disables the letters that have no entry of their own", () => {
    renderIndex();

    expect(screen.getByRole("button", { name: "Jump to A" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Jump to D" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Jump to B" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Jump to #" })).toBeDisabled();
  });

  it("jumps to the letter under the pointer and shows it in the bubble", () => {
    const { nav, onSelect } = renderIndex();

    fireEvent.pointerDown(nav, { pointerId: 1, clientY: slotY(1) });

    expect(nav.setPointerCapture).toHaveBeenCalledWith(1);
    expect(onSelect).toHaveBeenCalledWith(A);
    expect(bubble(nav)).toHaveTextContent("A");
    expect(bubble(nav)).toHaveStyle({ top: `${slotY(1) - 5}px` });
  });

  it("follows the scrub, sending a letter without entries to the next one that has them", () => {
    const { nav, onSelect } = renderIndex();

    fireEvent.pointerDown(nav, { pointerId: 1, clientY: slotY(1) });
    fireEvent.pointerMove(nav, { pointerId: 1, clientY: slotY(2) });

    expect(onSelect).toHaveBeenLastCalledWith(D);
    expect(bubble(nav)).toHaveTextContent("B");
  });

  it("does not jump again while the pointer stays on the same letter", () => {
    const { nav, onSelect } = renderIndex();

    fireEvent.pointerDown(nav, { pointerId: 1, clientY: slotY(4) });
    fireEvent.pointerMove(nav, { pointerId: 1, clientY: slotY(4) + 3 });

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("shows a letter past the last entry without jumping anywhere", () => {
    const { nav, onSelect } = renderIndex();

    fireEvent.pointerDown(nav, { pointerId: 1, clientY: slotY(10) });

    expect(onSelect).not.toHaveBeenCalled();
    expect(bubble(nav)).toHaveTextContent("J");
  });

  it("buzzes once per letter change when the device can vibrate", () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, "vibrate", { value: vibrate, configurable: true });
    const { nav } = renderIndex();

    fireEvent.pointerDown(nav, { pointerId: 1, clientY: slotY(1) });
    fireEvent.pointerMove(nav, { pointerId: 1, clientY: slotY(1) + 2 });

    expect(vibrate).toHaveBeenCalledTimes(1);
  });

  it("ignores a pointer hovering over the strip without pressing", () => {
    const { nav, onSelect } = renderIndex();

    fireEvent.pointerMove(nav, { pointerId: 1, clientY: slotY(1) });

    expect(onSelect).not.toHaveBeenCalled();
    expect(bubble(nav)).toBeNull();
  });

  it("hides the bubble and stops following once the pointer is released", () => {
    const { nav, onSelect } = renderIndex();

    fireEvent.pointerDown(nav, { pointerId: 1, clientY: slotY(1) });
    fireEvent.pointerUp(nav, { pointerId: 1 });
    fireEvent.pointerMove(nav, { pointerId: 1, clientY: slotY(4) });

    expect(bubble(nav)).toBeNull();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("hides the bubble when the pointer is cancelled", () => {
    const { nav } = renderIndex();

    fireEvent.pointerDown(nav, { pointerId: 1, clientY: slotY(1) });
    fireEvent.pointerCancel(nav, { pointerId: 1 });

    expect(bubble(nav)).toBeNull();
  });

  it("jumps from a keyboard activation of a letter", () => {
    const { onSelect } = renderIndex();

    fireEvent.click(screen.getByRole("button", { name: "Jump to D" }), { detail: 0 });

    expect(onSelect).toHaveBeenCalledWith(D);
  });

  it("leaves a pointer click to the scrub so it does not jump twice", () => {
    const { onSelect } = renderIndex();

    fireEvent.click(screen.getByRole("button", { name: "Jump to D" }), { detail: 1 });

    expect(onSelect).not.toHaveBeenCalled();
  });
});
