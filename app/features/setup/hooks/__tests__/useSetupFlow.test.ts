import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SetupProgress } from "../../types";
import { useSetupFlow } from "../useSetupFlow";

interface ProgressQuery {
  data: SetupProgress | undefined;
  isError: boolean;
  refetch: () => void;
}

const setMany = vi.fn();
const refetch = vi.fn();
const enabledSeen: boolean[] = [];

let signedIn: boolean;
let query: ProgressQuery;
let params: { question: string | undefined; server: string | undefined };

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: signedIn ? { id: "u1" } : null }),
}));

vi.mock("@hooks/api/queries/setup/useSetupProgress", () => ({
  useSetupProgress: ({ enabled }: { enabled: boolean }) => {
    enabledSeen.push(enabled);
    return query;
  },
}));

vi.mock("@hooks/ui/useUrlParam", () => ({
  useUrlParams: () => ({ values: params, setMany }),
}));

function progressOf(resumeAt: SetupProgress["resumeAt"]): SetupProgress {
  return {
    questions: [
      { id: "account", outcome: "answered" },
      { id: "media", outcome: null },
      { id: "downloads", outcome: null },
      { id: "metadata", outcome: null },
    ],
    resumeAt,
    finished: false,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  enabledSeen.length = 0;
  signedIn = true;
  query = { data: progressOf("downloads"), isError: false, refetch };
  params = { question: undefined, server: undefined };
});

describe("without a session", () => {
  it("shows only the account question whatever the address says, and asks the server for nothing", () => {
    signedIn = false;
    query = { data: undefined, isError: false, refetch };
    params = { question: "downloads", server: undefined };

    const { result } = renderHook(() => useSetupFlow());

    expect(result.current.state).toEqual({ kind: "step", step: "account", server: null });
    expect(enabledSeen.every((enabled) => !enabled)).toBe(true);
    expect(setMany).not.toHaveBeenCalled();
  });
});

describe("with a session", () => {
  it("waits for the server's progress before showing a question", () => {
    query = { data: undefined, isError: false, refetch };

    const { result } = renderHook(() => useSetupFlow());

    expect(result.current.state).toEqual({ kind: "loading" });
    expect(setMany).not.toHaveBeenCalled();
  });

  it("lets the visitor retry when the progress cannot be read", () => {
    query = { data: undefined, isError: true, refetch };

    const { result } = renderHook(() => useSetupFlow());

    if (result.current.state.kind !== "error") throw new Error("expected the error state");
    result.current.state.retry();

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("moves /setup with no question to the one the server says is next, and shows loading meanwhile", () => {
    const { result } = renderHook(() => useSetupFlow());

    expect(result.current.state).toEqual({ kind: "loading" });
    expect(setMany).toHaveBeenCalledWith({ question: "downloads", server: null });
  });

  it("never leaves a signed-in visitor on the closed account question", () => {
    params = { question: "account", server: undefined };

    renderHook(() => useSetupFlow());

    expect(setMany).toHaveBeenCalledWith({ question: "downloads", server: null });
  });

  it("sends a signed-in visitor with the account answered to the media question when nothing else is recorded", () => {
    query = { data: progressOf("account"), isError: false, refetch };

    renderHook(() => useSetupFlow());

    expect(setMany).toHaveBeenCalledWith({ question: "media", server: null });
  });

  it("shows the question in the address and writes nothing", () => {
    params = { question: "metadata", server: undefined };

    const { result } = renderHook(() => useSetupFlow());

    expect(result.current.state).toEqual({ kind: "step", step: "metadata", server: null });
    expect(setMany).not.toHaveBeenCalled();
  });

  it("carries the chosen server only on the media question", () => {
    params = { question: "media", server: "navidrome" };
    const media = renderHook(() => useSetupFlow());

    params = { question: "downloads", server: "navidrome" };
    const downloads = renderHook(() => useSetupFlow());

    expect(media.result.current.state).toEqual({ kind: "step", step: "media", server: "navidrome" });
    expect(downloads.result.current.state).toEqual({ kind: "step", step: "downloads", server: null });
  });

  it("writes the question and the server together when asked to go somewhere", () => {
    params = { question: "media", server: undefined };
    const { result } = renderHook(() => useSetupFlow());

    result.current.go("media", "jellyfin");
    result.current.go("downloads");

    expect(setMany).toHaveBeenNthCalledWith(1, { question: "media", server: "jellyfin" });
    expect(setMany).toHaveBeenNthCalledWith(2, { question: "downloads", server: null });
  });
});
