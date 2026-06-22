import { describe, it, expect, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import { useSettingsForm } from "../useSettingsForm";

interface Form {
  name: string;
  count: number;
}

const initial: Form = { name: "alpha", count: 1 };

describe("useSettingsForm", () => {
  it("seeds the draft from the initial value and reports a pristine form", () => {
    const { result } = renderHook(() => useSettingsForm(initial));

    expect(result.current.draft).toEqual(initial);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isSaving).toBe(false);
  });

  it("starts with a null draft when no initial value is given", () => {
    const { result } = renderHook(() => useSettingsForm<Form>(undefined));

    expect(result.current.draft).toBeNull();
    expect(result.current.isDirty).toBe(false);
  });

  it("updates a single field and turns dirty", () => {
    const { result } = renderHook(() => useSettingsForm(initial));

    act(() => {
      result.current.setField("name", "beta");
    });

    expect(result.current.draft).toEqual({ name: "beta", count: 1 });
    expect(result.current.isDirty).toBe(true);
  });

  it("ignores setField while the draft is null", () => {
    const { result } = renderHook(() => useSettingsForm<Form>(undefined));

    act(() => {
      result.current.setField("name", "beta");
    });

    expect(result.current.draft).toBeNull();
  });

  it("replaces the whole draft with setAll", () => {
    const { result } = renderHook(() => useSettingsForm(initial));

    act(() => {
      result.current.setAll({ name: "gamma", count: 9 });
    });

    expect(result.current.draft).toEqual({ name: "gamma", count: 9 });
    expect(result.current.isDirty).toBe(true);
  });

  it("reverts the draft back to the initial value on reset", () => {
    const { result } = renderHook(() => useSettingsForm(initial));

    act(() => {
      result.current.setField("name", "beta");
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.draft).toEqual(initial);
    expect(result.current.isDirty).toBe(false);
  });

  it("toggles isSaving around the mutator and forwards the draft", async () => {
    const { result } = renderHook(() => useSettingsForm(initial));

    act(() => {
      result.current.setField("count", 5);
    });

    const mutator = vi.fn().mockResolvedValue(undefined);
    await act(async () => {
      await result.current.save(mutator);
    });

    expect(mutator).toHaveBeenCalledWith({ name: "alpha", count: 5 });
    expect(result.current.isSaving).toBe(false);
  });

  it("clears isSaving even when the mutator rejects", async () => {
    const { result } = renderHook(() => useSettingsForm(initial));
    const mutator = vi.fn().mockRejectedValue(new Error("boom"));

    await act(async () => {
      await expect(result.current.save(mutator)).rejects.toThrow("boom");
    });

    expect(result.current.isSaving).toBe(false);
  });

  it("does nothing on save when the draft is null", async () => {
    const { result } = renderHook(() => useSettingsForm<Form>(undefined));
    const mutator = vi.fn();

    await act(async () => {
      await result.current.save(mutator);
    });

    expect(mutator).not.toHaveBeenCalled();
  });

  it("adopts a new initial value while the draft is still pristine", async () => {
    const { result, rerender } = renderHook(({ value }) => useSettingsForm(value), {
      initialProps: { value: initial },
    });

    const next: Form = { name: "delta", count: 2 };
    rerender({ value: next });

    await waitFor(() => {
      expect(result.current.draft).toEqual(next);
    });
  });

  it("keeps a dirty draft when a new initial value arrives", async () => {
    const { result, rerender } = renderHook(({ value }) => useSettingsForm(value), {
      initialProps: { value: initial },
    });

    act(() => {
      result.current.setField("name", "edited");
    });

    rerender({ value: { name: "delta", count: 2 } });

    await waitFor(() => {
      expect(result.current.draft).toEqual({ name: "edited", count: 1 });
    });
  });

  it("seeds a null draft once an initial value first appears", async () => {
    const { result, rerender } = renderHook(({ value }) => useSettingsForm(value), {
      initialProps: { value: undefined as Form | undefined },
    });

    expect(result.current.draft).toBeNull();

    rerender({ value: initial });

    await waitFor(() => {
      expect(result.current.draft).toEqual(initial);
    });
  });
});
