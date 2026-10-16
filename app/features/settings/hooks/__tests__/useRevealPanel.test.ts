import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import { useRevealPanel } from "../useRevealPanel";

function panelAt(top: number) {
  const panel = document.createElement("section");
  panel.getBoundingClientRect = () => DOMRect.fromRect({ x: 0, y: top, width: 600, height: 400 });
  panel.scrollIntoView = vi.fn();
  return panel;
}

function reveal(top: number) {
  const panel = panelAt(top);
  const { result } = renderHook(() => useRevealPanel());
  result.current.panelRef.current = panel;
  result.current.reveal();
  return panel;
}

beforeEach(() => {
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callback(0);
    return 0;
  });
  window.innerHeight = 800;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useRevealPanel", () => {
  it("scrolls a panel that starts below the screen into view", () => {
    const panel = reveal(900);

    expect(panel.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });

  it("scrolls a panel that only peeks in at the bottom of the screen", () => {
    expect(reveal(760).scrollIntoView).toHaveBeenCalledOnce();
  });

  it("scrolls a panel that starts above the screen back into view", () => {
    expect(reveal(-200).scrollIntoView).toHaveBeenCalledOnce();
  });

  it("leaves a panel already in the upper half of the screen where it is", () => {
    expect(reveal(180).scrollIntoView).not.toHaveBeenCalled();
  });

  it("does nothing before the panel has mounted", () => {
    const { result } = renderHook(() => useRevealPanel());

    expect(() => result.current.reveal()).not.toThrow();
  });
});
