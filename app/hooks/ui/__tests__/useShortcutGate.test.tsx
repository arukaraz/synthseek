import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import { useShortcutGate } from "../useShortcutGate";

const setting = vi.hoisted(() => ({ singleKeyShortcuts: true }));

vi.mock("@modules/providers/AccessibilityProvider", () => ({
  useAccessibility: () => ({ singleKeyShortcuts: setting.singleKeyShortcuts }),
}));

const letter = { key: "k", ctrlKey: false, metaKey: false, altKey: false };

describe("useShortcutGate", () => {
  it("lets single keys through while the switch is on", () => {
    setting.singleKeyShortcuts = true;
    const { result } = renderHook(() => useShortcutGate());

    expect(result.current(letter)).toBe(true);
  });

  it("blocks single keys but not modified or named keys while the switch is off", () => {
    setting.singleKeyShortcuts = false;
    const { result } = renderHook(() => useShortcutGate());

    expect(result.current(letter)).toBe(false);
    expect(result.current({ ...letter, ctrlKey: true })).toBe(true);
    expect(result.current({ ...letter, key: "Escape" })).toBe(true);
  });

  it("keeps one function while reading the latest setting", () => {
    setting.singleKeyShortcuts = true;
    const { result, rerender } = renderHook(() => useShortcutGate());
    const first = result.current;

    setting.singleKeyShortcuts = false;
    rerender();

    expect(result.current).toBe(first);
    expect(result.current(letter)).toBe(false);
  });
});
