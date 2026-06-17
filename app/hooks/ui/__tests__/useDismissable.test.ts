import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useDismissable } from "../useDismissable";

describe("useDismissable", () => {
  let container: HTMLDivElement;
  let outside: HTMLButtonElement;

  beforeEach(() => {
    container = document.createElement("div");
    outside = document.createElement("button");
    document.body.append(container, outside);
  });

  afterEach(() => {
    container.remove();
    outside.remove();
  });

  it("starts closed and toggles open then closed", () => {
    const { result } = renderHook(() => useDismissable<HTMLDivElement>());
    expect(result.current.open).toBe(false);

    act(() => result.current.toggle());
    expect(result.current.open).toBe(true);

    act(() => result.current.toggle());
    expect(result.current.open).toBe(false);
  });

  it("closes on a pointerdown outside the container", () => {
    const { result } = renderHook(() => useDismissable<HTMLDivElement>());

    act(() => {
      result.current.containerRef.current = container;
      result.current.toggle();
    });
    expect(result.current.open).toBe(true);

    act(() => {
      outside.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    });
    expect(result.current.open).toBe(false);
  });

  it("stays open on a pointerdown inside the container", () => {
    const { result } = renderHook(() => useDismissable<HTMLDivElement>());

    act(() => {
      result.current.containerRef.current = container;
      result.current.toggle();
    });

    act(() => {
      container.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    });
    expect(result.current.open).toBe(true);
  });

  it("closes on the Escape key", () => {
    const { result } = renderHook(() => useDismissable<HTMLDivElement>());

    act(() => result.current.toggle());
    expect(result.current.open).toBe(true);

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(result.current.open).toBe(false);
  });
});
