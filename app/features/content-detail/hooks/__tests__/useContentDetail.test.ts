import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useContentDetail } from "../useContentDetail";
import type { DetailTarget } from "../../types";

function target(id: string, mode: DetailTarget["mode"] = "album"): DetailTarget {
  return { mode, id, name: `Name ${id}`, artistName: "Daft Punk", cover: null };
}

function open(entry: DetailTarget | null, isOpen = true) {
  const args = { open: isOpen, target: entry };
  return renderHook(() => useContentDetail(args));
}

describe("the detail navigation stack", () => {
  it("holds nothing while the modal is shut", () => {
    const { result } = open(target("a"), false);

    expect(result.current.current).toBeNull();
    expect(result.current.canGoBack).toBe(false);
  });

  it("holds nothing when the modal was opened on nothing", () => {
    const { result } = open(null);

    expect(result.current.current).toBeNull();
  });

  it("opens on the entry the caller asked for", () => {
    const { result } = open(target("a"));

    expect(result.current.current?.id).toBe("a");
    expect(result.current.previous).toBeNull();
  });

  it("stacks a deeper entry over the one it came from", () => {
    const { result } = open(target("a"));

    act(() => {
      result.current.navigateTo(target("b", "artist"));
    });

    expect(result.current.current?.id).toBe("b");
    expect(result.current.previous?.id).toBe("a");
    expect(result.current.canGoBack).toBe(true);
  });

  it("goes back to the entry underneath", () => {
    const { result } = open(target("a"));
    act(() => {
      result.current.navigateTo(target("b"));
    });

    act(() => {
      result.current.goBack();
    });

    expect(result.current.current?.id).toBe("a");
    expect(result.current.canGoBack).toBe(false);
  });

  it("stays on the first entry rather than emptying itself", () => {
    const { result } = open(target("a"));

    act(() => {
      result.current.goBack();
    });

    expect(result.current.current?.id).toBe("a");
  });

  it("starts a fresh stack when the modal is reopened on something else", () => {
    const first = target("a");
    const third = target("c");
    const { result, rerender } = renderHook(
      (props: { open: boolean; target: DetailTarget | null }) => useContentDetail(props),
      { initialProps: { open: true, target: first } }
    );
    act(() => {
      result.current.navigateTo(target("b"));
    });

    rerender({ open: true, target: third });

    expect(result.current.current?.id).toBe("c");
    expect(result.current.canGoBack).toBe(false);
  });

  it("empties the stack and tells the caller when the modal is dismissed", () => {
    const onClose = vi.fn();
    const { result } = open(target("a"));

    act(() => {
      result.current.handleOpenChange(false, onClose);
    });

    expect(onClose).toHaveBeenCalled();
    expect(result.current.current).toBeNull();
  });

  it("ignores an open it did not ask for", () => {
    const onClose = vi.fn();
    const { result } = open(target("a"));

    act(() => {
      result.current.handleOpenChange(true, onClose);
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(result.current.current?.id).toBe("a");
  });
});

describe("the page behind the modal", () => {
  it("stops the page scrolling while the modal is up", () => {
    open(target("a"));

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("gives the page its scrolling back when the modal goes", () => {
    document.body.style.overflow = "auto";
    const { unmount } = open(target("a"));

    unmount();

    expect(document.body.style.overflow).toBe("auto");
  });

  it("leaves the page alone while the modal is shut", () => {
    document.body.style.overflow = "";
    open(target("a"), false);

    expect(document.body.style.overflow).toBe("");
  });
});
