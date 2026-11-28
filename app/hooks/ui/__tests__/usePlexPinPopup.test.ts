import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { usePlexPinPopup } from "../usePlexPinPopup";

const spies = vi.hoisted(() => ({
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: spies.toastError, success: spies.toastSuccess },
}));

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 2 * 60 * 1000;

function fakeWindow(): Window {
  return { closed: false, close: vi.fn() } as unknown as Window;
}

describe("usePlexPinPopup", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    spies.toastError.mockReset();
    spies.toastSuccess.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("aborts immediately with an error when the popup is blocked, without waiting for the timeout", async () => {
    vi.spyOn(window, "open").mockReturnValue(null);
    const poll = vi.fn();
    const onResolved = vi.fn();
    const { result } = renderHook(() =>
      usePlexPinPopup({
        start: async () => ({ pinId: "pin-1", authUrl: "https://plex.tv/auth" }),
        poll,
        onResolved,
        popupBlockedMessage: "blocked",
      })
    );

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.phase).toBe("error");
    expect(spies.toastError).toHaveBeenCalledWith("blocked");
    expect(poll).not.toHaveBeenCalled();
    expect(onResolved).not.toHaveBeenCalled();
  });

  it("polls and resolves, calling onResolved and reaching the completed phase", async () => {
    vi.spyOn(window, "open").mockReturnValue(fakeWindow());
    const poll = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({ value: "ok" });
    const onResolved = vi.fn();
    const { result } = renderHook(() =>
      usePlexPinPopup({
        start: async () => ({ pinId: "pin-1", authUrl: "https://plex.tv/auth" }),
        poll,
        onResolved,
      })
    );

    await act(async () => {
      await result.current.start();
    });
    expect(result.current.phase).toBe("pending");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
    });
    expect(onResolved).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
    });

    expect(result.current.phase).toBe("completed");
    expect(onResolved).toHaveBeenCalledWith({ value: "ok" });
  });

  it("surfaces an error toast and the error phase when polling throws", async () => {
    vi.spyOn(window, "open").mockReturnValue(fakeWindow());
    const poll = vi.fn().mockRejectedValue(new Error("plex exploded"));
    const onResolved = vi.fn();
    const { result } = renderHook(() =>
      usePlexPinPopup({
        start: async () => ({ pinId: "pin-1", authUrl: "https://plex.tv/auth" }),
        poll,
        onResolved,
      })
    );

    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
    });

    expect(result.current.phase).toBe("error");
    expect(spies.toastError).toHaveBeenCalledWith("plex exploded");
    expect(onResolved).not.toHaveBeenCalled();
  });

  it("times out and reports an error when the pin is never authenticated", async () => {
    vi.spyOn(window, "open").mockReturnValue(fakeWindow());
    const poll = vi.fn().mockResolvedValue(null);
    const onResolved = vi.fn();
    const { result } = renderHook(() =>
      usePlexPinPopup({
        start: async () => ({ pinId: "pin-1", authUrl: "https://plex.tv/auth" }),
        poll,
        onResolved,
        timeoutMessage: "timed out",
      })
    );

    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_TIMEOUT_MS);
    });

    expect(result.current.phase).toBe("error");
    expect(spies.toastError).toHaveBeenCalledWith("timed out");
    expect(onResolved).not.toHaveBeenCalled();
  });

  describe("with an onFailure handler", () => {
    const start = async () => ({ pinId: "pin-1", authUrl: "https://plex.tv/auth" });

    it("hands a blocked popup to the handler instead of a toast", async () => {
      vi.spyOn(window, "open").mockReturnValue(null);
      const onFailure = vi.fn();
      const { result } = renderHook(() => usePlexPinPopup({ start, poll: vi.fn(), onResolved: vi.fn(), onFailure }));

      await act(async () => {
        await result.current.start();
      });

      expect(onFailure).toHaveBeenCalledWith({ kind: "popupBlocked" });
      expect(result.current.phase).toBe("error");
      expect(spies.toastError).not.toHaveBeenCalled();
    });

    it("hands a timeout to the handler instead of a toast", async () => {
      vi.spyOn(window, "open").mockReturnValue(fakeWindow());
      const onFailure = vi.fn();
      const { result } = renderHook(() =>
        usePlexPinPopup({ start, poll: vi.fn().mockResolvedValue(null), onResolved: vi.fn(), onFailure })
      );

      await act(async () => {
        await result.current.start();
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(POLL_TIMEOUT_MS);
      });

      expect(onFailure).toHaveBeenCalledWith({ kind: "timeout" });
      expect(spies.toastError).not.toHaveBeenCalled();
    });

    it("hands the error that stopped the polling to the handler, whatever its type", async () => {
      vi.spyOn(window, "open").mockReturnValue(fakeWindow());
      const refusal = { data: { appCode: "PLEX_USER_NOT_LINKED" } };
      const onFailure = vi.fn();
      const { result } = renderHook(() =>
        usePlexPinPopup({ start, poll: vi.fn().mockRejectedValue(refusal), onResolved: vi.fn(), onFailure })
      );

      await act(async () => {
        await result.current.start();
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
      });

      expect(onFailure).toHaveBeenCalledWith({ kind: "failed", error: refusal });
      expect(spies.toastError).not.toHaveBeenCalled();
    });

    it("hands the error that stopped the pin from starting to the handler", async () => {
      const failure = new Error("plex is down");
      const onFailure = vi.fn();
      const { result } = renderHook(() =>
        usePlexPinPopup({
          start: () => Promise.reject(failure),
          poll: vi.fn(),
          onResolved: vi.fn(),
          onFailure,
        })
      );

      await act(async () => {
        await result.current.start();
      });

      expect(onFailure).toHaveBeenCalledWith({ kind: "failed", error: failure });
      expect(spies.toastError).not.toHaveBeenCalled();
    });
  });
});
