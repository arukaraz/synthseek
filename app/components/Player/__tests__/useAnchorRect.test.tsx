import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PANEL_ANCHOR_GAP_PX, PANEL_VIEWPORT_MARGIN_PX, PANEL_WIDTH_PX } from "../constants";
import { useAnchorRect } from "../useAnchorRect";

const SELECTOR = "[data-anchor-probe]";

let wide = true;
const mediaListeners = new Set<() => void>();

function stubMatchMedia(): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      get matches() {
        return wide;
      },
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: (_event: string, listener: () => void) => {
        mediaListeners.add(listener);
      },
      removeEventListener: (_event: string, listener: () => void) => {
        mediaListeners.delete(listener);
      },
      dispatchEvent: vi.fn(),
    }),
  });
}

function addToggle(rect: { top: number; bottom: number; left: number; width: number }): HTMLElement {
  const toggle = document.createElement("button");
  toggle.setAttribute("data-anchor-probe", "");
  toggle.getBoundingClientRect = () => new DOMRect(rect.left, rect.top, rect.width, rect.bottom - rect.top);
  document.body.appendChild(toggle);
  return toggle;
}

beforeEach(() => {
  mediaListeners.clear();
  wide = true;
  stubMatchMedia();
  Object.defineProperty(window, "innerWidth", { value: 1400, configurable: true, writable: true });
  Object.defineProperty(window, "innerHeight", { value: 900, configurable: true, writable: true });
});

afterEach(() => {
  document.querySelectorAll(SELECTOR).forEach((node) => node.remove());
});

describe("useAnchorRect", () => {
  it("offers no anchor while the panel is not anchored to anything", () => {
    addToggle({ top: 100, bottom: 130, left: 200, width: 40 });

    const { result } = renderHook(() => useAnchorRect(SELECTOR, false));

    expect(result.current).toBeNull();
  });

  it("offers no anchor when the toggle is not on screen", () => {
    const { result } = renderHook(() => useAnchorRect(SELECTOR, true));

    expect(result.current).toBeNull();
  });

  it("offers no anchor on a screen too narrow to place a panel beside the toggle", () => {
    addToggle({ top: 100, bottom: 130, left: 200, width: 40 });
    wide = false;

    const { result } = renderHook(() => useAnchorRect(SELECTOR, true));

    expect(result.current).toBeNull();
  });

  it("opens the panel downwards from a toggle in the upper half of the screen", () => {
    addToggle({ top: 100, bottom: 130, left: 200, width: 40 });

    const { result } = renderHook(() => useAnchorRect(SELECTOR, true));

    expect(result.current?.below).toBe(true);
    expect(result.current?.top).toBe(130 + PANEL_ANCHOR_GAP_PX);
    expect(result.current?.room).toBe(900 - 130 - PANEL_ANCHOR_GAP_PX * 2);
  });

  it("opens the panel upwards from a toggle in the lower half of the screen", () => {
    addToggle({ top: 800, bottom: 830, left: 200, width: 40 });

    const { result } = renderHook(() => useAnchorRect(SELECTOR, true));

    expect(result.current?.below).toBe(false);
    expect(result.current?.bottom).toBe(900 - 800 + PANEL_ANCHOR_GAP_PX);
    expect(result.current?.room).toBe(800 - PANEL_ANCHOR_GAP_PX * 2);
  });

  it("keeps the panel inside the right edge of the window", () => {
    addToggle({ top: 100, bottom: 130, left: 1380, width: 40 });

    const { result } = renderHook(() => useAnchorRect(SELECTOR, true));

    expect(result.current?.left).toBe(1400 - PANEL_WIDTH_PX - PANEL_VIEWPORT_MARGIN_PX);
  });

  it("keeps the panel inside the left edge of the window", () => {
    addToggle({ top: 100, bottom: 130, left: 2, width: 40 });

    const { result } = renderHook(() => useAnchorRect(SELECTOR, true));

    expect(result.current?.left).toBe(PANEL_VIEWPORT_MARGIN_PX);
  });

  it("measures again when the window is resized under it", () => {
    const toggle = addToggle({ top: 100, bottom: 130, left: 200, width: 40 });
    const { result } = renderHook(() => useAnchorRect(SELECTOR, true));

    toggle.getBoundingClientRect = () => new DOMRect(500, 300, 40, 30);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current?.left).toBe(500);
  });

  it("measures again when the screen crosses the width the panel needs", () => {
    addToggle({ top: 100, bottom: 130, left: 200, width: 40 });
    const { result } = renderHook(() => useAnchorRect(SELECTOR, true));
    expect(result.current).not.toBeNull();

    wide = false;
    act(() => {
      mediaListeners.forEach((listener) => listener());
    });

    expect(result.current).toBeNull();
  });

  it("stops measuring once the panel is closed", () => {
    addToggle({ top: 100, bottom: 130, left: 200, width: 40 });
    const { unmount } = renderHook(() => useAnchorRect(SELECTOR, true));

    unmount();

    expect(mediaListeners.size).toBe(0);
  });
});
