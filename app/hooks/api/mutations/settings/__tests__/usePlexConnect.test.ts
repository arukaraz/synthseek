import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePlexConnect } from "../usePlexConnect";

const api = vi.hoisted(() => ({
  start: vi.fn(),
  poll: vi.fn(),
  save: vi.fn(),
  invalidate: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  errorToast: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: api.toastSuccess, error: api.toastError, info: vi.fn(), warning: vi.fn() },
}));

vi.mock("@modules/errors", () => ({ errorToast: api.errorToast }));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      settings: { get: { invalidate: api.invalidate }, plexStatus: { invalidate: api.invalidate } },
    }),
    settings: {
      plexConnectStart: { useMutation: () => ({ mutateAsync: api.start }) },
      plexConnectPoll: { useMutation: () => ({ mutateAsync: api.poll }) },
      plexConnectSave: { useMutation: () => ({ mutateAsync: api.save }) },
    },
  },
}));

const POLL_MS = 2000;
const TIMEOUT_MS = 2 * 60 * 1000;
const server = { name: "Home", clientIdentifier: "a", uri: "http://home:32400", local: true };

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  vi.stubGlobal(
    "open",
    vi.fn(() => null)
  );
  api.start.mockResolvedValue({ pinId: 1, authUrl: "https://plex.tv/auth" });
  api.poll.mockResolvedValue({ status: "ready", token: "tok", servers: [server] });
  api.save.mockResolvedValue({ ok: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function reachPicking(result: { current: ReturnType<typeof usePlexConnect> }) {
  await act(async () => {
    await result.current.start();
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(POLL_MS);
  });
}

describe("with the default feedback", () => {
  it("toasts when the sign-in cannot start", async () => {
    api.start.mockRejectedValueOnce(new Error("down"));
    const { result } = renderHook(() => usePlexConnect());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.state.kind).toBe("error");
    expect(api.errorToast).toHaveBeenCalledWith(expect.any(Error), "plexConnect.loginFailed");
  });

  it("toasts when the sign-in times out and when the server is saved", async () => {
    const waiting = renderHook(() => usePlexConnect());
    api.poll.mockResolvedValue({ status: "pending" });
    await act(async () => {
      await waiting.result.current.start();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(TIMEOUT_MS);
    });
    expect(api.toastError).toHaveBeenCalledTimes(1);

    api.poll.mockResolvedValue({ status: "ready", token: "tok", servers: [server] });
    const saving = renderHook(() => usePlexConnect());
    await reachPicking(saving.result);
    await act(async () => {
      await saving.result.current.saveServer(server.uri);
    });

    expect(saving.result.current.state.kind).toBe("done");
    expect(api.toastSuccess).toHaveBeenCalledTimes(1);
  });
});

describe("when silent, the caller shows the outcome itself", () => {
  it("says nothing when the sign-in cannot start", async () => {
    api.start.mockRejectedValueOnce(new Error("down"));
    const { result } = renderHook(() => usePlexConnect({ silent: true }));

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.state.kind).toBe("error");
    expect(api.errorToast).not.toHaveBeenCalled();
  });

  it("says nothing when the sign-in times out", async () => {
    api.poll.mockResolvedValue({ status: "pending" });
    const { result } = renderHook(() => usePlexConnect({ silent: true }));
    await act(async () => {
      await result.current.start();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(TIMEOUT_MS);
    });

    expect(result.current.state.kind).toBe("error");
    expect(api.toastError).not.toHaveBeenCalled();
  });

  it("says nothing when polling fails", async () => {
    api.poll.mockRejectedValueOnce(new Error("gone"));
    const { result } = renderHook(() => usePlexConnect({ silent: true }));

    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_MS);
    });

    expect(result.current.state.kind).toBe("error");
    expect(api.errorToast).not.toHaveBeenCalled();
  });

  it("says nothing when the server is saved, and still refreshes the settings", async () => {
    const { result } = renderHook(() => usePlexConnect({ silent: true }));
    await reachPicking(result);
    expect(result.current.state.kind).toBe("picking");

    await act(async () => {
      await result.current.saveServer(server.uri);
    });

    expect(result.current.state.kind).toBe("done");
    expect(api.save).toHaveBeenCalledWith({ url: server.uri, token: "tok" });
    expect(api.invalidate).toHaveBeenCalled();
    expect(api.toastSuccess).not.toHaveBeenCalled();
  });

  it("says nothing when saving the server fails", async () => {
    api.save.mockRejectedValueOnce(new Error("no"));
    const { result } = renderHook(() => usePlexConnect({ silent: true }));
    await reachPicking(result);

    await act(async () => {
      await result.current.saveServer(server.uri);
    });

    expect(result.current.state.kind).toBe("error");
    expect(api.errorToast).not.toHaveBeenCalled();
  });
});
