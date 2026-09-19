import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDebouncedDraft } from "../useDebouncedDraft";

function settle(ms = 300) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe("useDebouncedDraft", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("shows what was typed straight away", () => {
    const { result } = renderHook(() => useDebouncedDraft("", vi.fn()));

    act(() => result.current[1]("mex"));

    expect(result.current[0]).toBe("mex");
  });

  it("commits once the typing settles, not on every keystroke", () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useDebouncedDraft("", onCommit));

    act(() => result.current[1]("m"));
    act(() => result.current[1]("me"));
    act(() => result.current[1]("mex"));
    expect(onCommit).not.toHaveBeenCalled();

    settle();
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith("mex");
  });

  it("keeps the characters typed while the committed value was echoing back", () => {
    const onCommit = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useDebouncedDraft(value, onCommit), {
      initialProps: { value: "" },
    });

    act(() => result.current[1]("mex"));
    settle();
    expect(onCommit).toHaveBeenCalledWith("mex");

    act(() => result.current[1]("mexi"));
    rerender({ value: "mex" });

    expect(result.current[0]).toBe("mexi");
  });

  it("adopts a value that changed from outside, such as the filters being cleared", () => {
    const onCommit = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useDebouncedDraft(value, onCommit), {
      initialProps: { value: "" },
    });

    act(() => result.current[1]("mex"));
    settle();
    rerender({ value: "mex" });
    onCommit.mockClear();

    rerender({ value: "" });
    expect(result.current[0]).toBe("");
  });

  it("does not push the cleared draft back out as a fresh commit", () => {
    const onCommit = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useDebouncedDraft(value, onCommit), {
      initialProps: { value: "" },
    });

    act(() => result.current[1]("mex"));
    settle();
    rerender({ value: "mex" });
    onCommit.mockClear();

    rerender({ value: "" });
    settle();

    expect(onCommit).not.toHaveBeenCalled();
  });

  it("commits nothing on the first render", () => {
    const onCommit = vi.fn();
    renderHook(() => useDebouncedDraft("already here", onCommit));

    settle();

    expect(onCommit).not.toHaveBeenCalled();
  });

  it("commits an empty draft when the reader clears the box themselves", () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useDebouncedDraft("mex", onCommit));

    act(() => result.current[1](""));
    settle();

    expect(onCommit).toHaveBeenCalledWith("");
  });
});
