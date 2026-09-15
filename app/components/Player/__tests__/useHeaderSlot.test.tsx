import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PLAYER_HEADER_SLOT_ID, PLAYER_MODE_ATTRIBUTE } from "../constants";

const mini = vi.hoisted(() => ({
  body: null as HTMLElement | null,
  listeners: new Set<() => void>(),
}));

vi.mock("../miniWindow", () => ({
  miniWindowBody: () => mini.body,
  subscribeMiniWindow: (listener: () => void) => {
    mini.listeners.add(listener);
    return () => {
      mini.listeners.delete(listener);
    };
  },
}));

import { usePlayerPlacement } from "../useHeaderSlot";

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

function addHeaderSlot(): HTMLElement {
  const slot = document.createElement("div");
  slot.id = PLAYER_HEADER_SLOT_ID;
  document.body.appendChild(slot);
  return slot;
}

beforeEach(() => {
  wide = true;
  mediaListeners.clear();
  mini.listeners.clear();
  mini.body = null;
  stubMatchMedia();
});

afterEach(() => {
  document.getElementById(PLAYER_HEADER_SLOT_ID)?.remove();
  document.documentElement.removeAttribute(PLAYER_MODE_ATTRIBUTE);
});

describe("usePlayerPlacement", () => {
  it("leaves the normal player in the dock with no target to move into", () => {
    addHeaderSlot();

    const { result } = renderHook(() => usePlayerPlacement("normal", false));

    expect(result.current.target).toBeNull();
    expect(result.current.effective).toBe("normal");
  });

  it("moves the compact player into the header slot", () => {
    const slot = addHeaderSlot();

    const { result } = renderHook(() => usePlayerPlacement("compact", false));

    expect(result.current.target).toBe(slot);
    expect(result.current.effective).toBe("compact");
  });

  it("falls back to the normal dock when the header has no slot", () => {
    const { result } = renderHook(() => usePlayerPlacement("compact", false));

    expect(result.current.target).toBeNull();
    expect(result.current.effective).toBe("normal");
  });

  it("falls back to the normal dock on a screen too narrow for the header slot", () => {
    addHeaderSlot();
    wide = false;

    const { result } = renderHook(() => usePlayerPlacement("compact", false));

    expect(result.current.effective).toBe("normal");
  });

  it("gives the compact player back to the dock while the full stage is up", () => {
    addHeaderSlot();

    const { result } = renderHook(() => usePlayerPlacement("compact", true));

    expect(result.current.target).toBeNull();
    expect(result.current.effective).toBe("normal");
  });

  it("follows the screen across the width the header slot needs", () => {
    addHeaderSlot();
    const { result } = renderHook(() => usePlayerPlacement("compact", false));
    expect(result.current.effective).toBe("compact");

    wide = false;
    act(() => {
      mediaListeners.forEach((listener) => listener());
    });

    expect(result.current.effective).toBe("normal");
  });

  it("renders the mini player into the detached window once it is open", () => {
    const body = document.createElement("body");
    mini.body = body;

    const { result } = renderHook(() => usePlayerPlacement("mini", false));

    expect(result.current.target).toBe(body);
    expect(result.current.effective).toBe("mini");
  });

  it("falls back to the normal dock while the detached window is not open yet", () => {
    const { result } = renderHook(() => usePlayerPlacement("mini", false));

    expect(result.current.target).toBeNull();
    expect(result.current.effective).toBe("normal");
  });

  it("follows the detached window as it opens", () => {
    const { result } = renderHook(() => usePlayerPlacement("mini", false));
    expect(result.current.effective).toBe("normal");

    act(() => {
      mini.body = document.createElement("body");
      mini.listeners.forEach((listener) => listener());
    });

    expect(result.current.effective).toBe("mini");
  });

  it("tells the stylesheet which mode the player actually settled on", () => {
    addHeaderSlot();

    renderHook(() => usePlayerPlacement("compact", false));

    expect(document.documentElement.getAttribute(PLAYER_MODE_ATTRIBUTE)).toBe("compact");
  });

  it("takes the mode off the document when the player goes away", () => {
    addHeaderSlot();
    const { unmount } = renderHook(() => usePlayerPlacement("compact", false));

    unmount();

    expect(document.documentElement.getAttribute(PLAYER_MODE_ATTRIBUTE)).toBeNull();
  });
});
