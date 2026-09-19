import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useRangePreview } from "../useRangePreview";

function holdShift() {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "Shift", shiftKey: true }));
}

function releaseShift() {
  window.dispatchEvent(new KeyboardEvent("keyup", { key: "Shift", shiftKey: false }));
}

describe("useRangePreview", () => {
  it("previews nothing while shift is not held", () => {
    const { result } = renderHook(() => useRangePreview());

    act(() => result.current.trackRow("row-3"));

    expect(result.current.previewId).toBeNull();
  });

  it("previews the hovered row once shift goes down, without needing a new hover", () => {
    const { result } = renderHook(() => useRangePreview());

    act(() => result.current.trackRow("row-3"));
    act(() => holdShift());

    expect(result.current.previewId).toBe("row-3");
  });

  it("follows the cursor while shift stays down", () => {
    const { result } = renderHook(() => useRangePreview());

    act(() => holdShift());
    act(() => result.current.trackRow("row-7"));

    expect(result.current.previewId).toBe("row-7");
  });

  it("drops the preview when shift comes back up", () => {
    const { result } = renderHook(() => useRangePreview());

    act(() => result.current.trackRow("row-3"));
    act(() => holdShift());
    act(() => releaseShift());

    expect(result.current.previewId).toBeNull();
  });

  it("drops the preview when the window loses focus with shift still down, so it cannot stick", () => {
    const { result } = renderHook(() => useRangePreview());

    act(() => result.current.trackRow("row-3"));
    act(() => holdShift());
    act(() => window.dispatchEvent(new Event("blur")));

    expect(result.current.previewId).toBeNull();
  });

  it("drops the preview when the cursor leaves the rows", () => {
    const { result } = renderHook(() => useRangePreview());

    act(() => holdShift());
    act(() => result.current.trackRow("row-3"));
    act(() => result.current.trackRow(null));

    expect(result.current.previewId).toBeNull();
  });
});
