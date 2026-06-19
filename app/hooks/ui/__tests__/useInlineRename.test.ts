import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useInlineRename } from "../useInlineRename";

describe("useInlineRename", () => {
  it("starts not editing and seeds the draft from the value on start", () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useInlineRename({ value: "Road Trip", onSave }));

    expect(result.current.isEditing).toBe(false);

    act(() => result.current.start());

    expect(result.current.isEditing).toBe(true);
    expect(result.current.draft).toBe("Road Trip");
  });

  it("saves a trimmed changed value and closes editing", () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useInlineRename({ value: "Road Trip", onSave }));

    act(() => result.current.start());
    act(() => result.current.setDraft("  Summer Mix  "));
    act(() => result.current.save());

    expect(onSave).toHaveBeenCalledWith("Summer Mix");
    expect(result.current.isEditing).toBe(false);
  });

  it("does not save an empty or unchanged value but still closes editing", () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useInlineRename({ value: "Road Trip", onSave }));

    act(() => result.current.start());
    act(() => result.current.setDraft("   "));
    act(() => result.current.save());

    expect(onSave).not.toHaveBeenCalled();
    expect(result.current.isEditing).toBe(false);

    act(() => result.current.start());
    act(() => result.current.setDraft("Road Trip"));
    act(() => result.current.save());

    expect(onSave).not.toHaveBeenCalled();
  });

  it("cancel closes editing without saving", () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useInlineRename({ value: "Road Trip", onSave }));

    act(() => result.current.start());
    act(() => result.current.setDraft("Discarded"));
    act(() => result.current.cancel());

    expect(onSave).not.toHaveBeenCalled();
    expect(result.current.isEditing).toBe(false);
  });
});
