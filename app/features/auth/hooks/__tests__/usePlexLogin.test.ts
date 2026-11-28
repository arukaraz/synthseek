import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@test/mocks/next.mock";
import { mockRouter, resetNextMocks } from "@test/mocks/next.mock";
import enAuth from "@modules/i18n/messages/en/auth.json";
import type { UsePlexPinPopupOptions } from "@hooks/ui/types";

const captured = vi.hoisted(() => ({
  options: undefined as UsePlexPinPopupOptions<unknown> | undefined,
  start: vi.fn(),
}));

vi.mock("@hooks/api/mutations/auth/usePlexLoginFlow", () => ({
  usePlexLoginFlow: () => ({ start: vi.fn(), poll: vi.fn() }),
}));

vi.mock("@hooks/ui/usePlexPinPopup", () => ({
  usePlexPinPopup: (options: UsePlexPinPopupOptions<unknown>) => {
    captured.options = options;
    return { start: captured.start, reset: vi.fn(), phase: "idle", isPending: false };
  },
}));

import { usePlexLogin } from "../usePlexLogin";

beforeEach(() => {
  vi.clearAllMocks();
  resetNextMocks();
  captured.options = undefined;
});

afterEach(() => {
  window.history.replaceState({}, "", "/");
});

describe("usePlexLogin", () => {
  it("goes home when Plex signs the listener in and no destination was asked for", () => {
    renderHook(() => usePlexLogin());

    act(() => captured.options?.onResolved(null));

    expect(mockRouter.replace).toHaveBeenCalledWith("/");
  });

  it("goes to the deep link the listener came for", () => {
    window.history.replaceState({}, "", `/login?next=${encodeURIComponent("/oauth/consent?grant=g-1")}`);
    renderHook(() => usePlexLogin());

    act(() => captured.options?.onResolved(null));

    expect(mockRouter.replace).toHaveBeenCalledWith("/oauth/consent?grant=g-1");
  });

  it("goes home instead of to a hostile destination", () => {
    window.history.replaceState({}, "", `/login?next=${encodeURIComponent("//evil.example")}`);
    renderHook(() => usePlexLogin());

    act(() => captured.options?.onResolved(null));

    expect(mockRouter.replace).toHaveBeenCalledWith("/");
  });

  it("explains a blocked popup inline", () => {
    const { result } = renderHook(() => usePlexLogin());

    act(() => captured.options?.onFailure?.({ kind: "popupBlocked" }));

    expect(result.current.failure).toEqual({ kind: "message", title: enAuth.auth.plex.popupBlocked });
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("sends the visitor to setup when the server has no administrator", () => {
    const { result } = renderHook(() => usePlexLogin());

    act(() =>
      captured.options?.onFailure?.({
        kind: "failed",
        error: { message: "x", data: { appCode: "PLEX_SIGN_IN_NEEDS_SETUP", appParams: {} } },
      })
    );

    expect(mockRouter.replace).toHaveBeenCalledWith("/setup");
    expect(result.current.failure).toBeNull();
  });

  it("clears the previous failure when the listener tries again", () => {
    const { result } = renderHook(() => usePlexLogin());
    act(() => captured.options?.onFailure?.({ kind: "timeout" }));
    expect(result.current.failure).not.toBeNull();

    act(() => result.current.startLogin());

    expect(result.current.failure).toBeNull();
    expect(captured.start).toHaveBeenCalledTimes(1);
  });
});
