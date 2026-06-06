import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

import { useSetupRedirect } from "../useSetupRedirect";
import type { SetupRedirectContext } from "../types";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

const setupRefetch = vi.fn();
const authRefetch = vi.fn();

interface SetupQueryShape {
  data: boolean | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

interface AuthShape {
  currentUser: { id: string } | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

let setupQueryState: SetupQueryShape;
let authState: AuthShape;

vi.mock("@hooks/api/queries/useSetupRequired", () => ({
  useSetupRequired: () => setupQueryState,
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => authState,
}));

const resolvedSetup = (value: boolean): SetupQueryShape => ({
  data: value,
  isLoading: false,
  isError: false,
  refetch: setupRefetch,
});

const loadingSetup = (): SetupQueryShape => ({
  data: undefined,
  isLoading: true,
  isError: false,
  refetch: setupRefetch,
});

const undefinedSetup = (): SetupQueryShape => ({
  data: undefined,
  isLoading: false,
  isError: false,
  refetch: setupRefetch,
});

const erroredSetup = (): SetupQueryShape => ({
  data: undefined,
  isLoading: false,
  isError: true,
  refetch: setupRefetch,
});

const withUser = (): AuthShape => ({
  currentUser: { id: "user_1" },
  isLoading: false,
  isError: false,
  refetch: authRefetch,
});
const withoutUser = (): AuthShape => ({
  currentUser: null,
  isLoading: false,
  isError: false,
  refetch: authRefetch,
});
const loadingAuth = (): AuthShape => ({
  currentUser: null,
  isLoading: true,
  isError: false,
  refetch: authRefetch,
});
const erroredAuth = (): AuthShape => ({
  currentUser: null,
  isLoading: false,
  isError: true,
  refetch: authRefetch,
});

const renderGate = (context: SetupRedirectContext) => renderHook(() => useSetupRedirect(context));

describe("useSetupRedirect", () => {
  beforeEach(() => {
    replace.mockClear();
    setupRefetch.mockClear();
    authRefetch.mockClear();
    setupQueryState = resolvedSetup(false);
    authState = withoutUser();
  });

  describe("context: app", () => {
    it("redirects to /setup and reports redirecting when setup is required", () => {
      setupQueryState = resolvedSetup(true);
      authState = withoutUser();

      const { result } = renderGate("app");

      expect(result.current).toEqual({ status: "redirecting" });
      expect(replace).toHaveBeenCalledWith("/setup");
    });

    it("redirects to /login and reports redirecting when setup not required and no user", () => {
      setupQueryState = resolvedSetup(false);
      authState = withoutUser();

      const { result } = renderGate("app");

      expect(result.current).toEqual({ status: "redirecting" });
      expect(replace).toHaveBeenCalledWith("/login");
    });

    it("reports ready and does not redirect when setup not required and a user exists", () => {
      setupQueryState = resolvedSetup(false);
      authState = withUser();

      const { result } = renderGate("app");

      expect(result.current).toEqual({ status: "ready" });
      expect(replace).not.toHaveBeenCalled();
    });

    it("reports resolving and does not redirect while the setup query is loading", () => {
      setupQueryState = loadingSetup();
      authState = withUser();

      const { result } = renderGate("app");

      expect(result.current).toEqual({ status: "resolving" });
      expect(replace).not.toHaveBeenCalled();
    });

    it("reports resolving while auth is loading", () => {
      setupQueryState = resolvedSetup(false);
      authState = loadingAuth();

      const { result } = renderGate("app");

      expect(result.current).toEqual({ status: "resolving" });
      expect(replace).not.toHaveBeenCalled();
    });

    it("reports resolving when data is undefined and not errored", () => {
      setupQueryState = undefinedSetup();
      authState = withUser();

      const { result } = renderGate("app");

      expect(result.current).toEqual({ status: "resolving" });
      expect(replace).not.toHaveBeenCalled();
    });

    it("reports error and does not redirect on setup query error", () => {
      setupQueryState = erroredSetup();
      authState = withoutUser();

      const { result } = renderGate("app");

      expect(result.current.status).toBe("error");
      expect(replace).not.toHaveBeenCalled();
    });

    it("reports error when the auth me query errors", () => {
      setupQueryState = resolvedSetup(false);
      authState = erroredAuth();

      const { result } = renderGate("app");

      expect(result.current.status).toBe("error");
      expect(replace).not.toHaveBeenCalled();
    });

    it("retry refetches both the setup and auth queries", () => {
      setupQueryState = erroredSetup();
      authState = withoutUser();

      const { result } = renderGate("app");

      if (result.current.status !== "error") throw new Error("expected error gate");
      result.current.retry();

      expect(setupRefetch).toHaveBeenCalledTimes(1);
      expect(authRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("context: login", () => {
    it("redirects to /setup and reports redirecting when setup is required", () => {
      setupQueryState = resolvedSetup(true);
      authState = withoutUser();

      const { result } = renderGate("login");

      expect(result.current).toEqual({ status: "redirecting" });
      expect(replace).toHaveBeenCalledWith("/setup");
    });

    it("redirects to / and reports redirecting when setup not required and a user exists", () => {
      setupQueryState = resolvedSetup(false);
      authState = withUser();

      const { result } = renderGate("login");

      expect(result.current).toEqual({ status: "redirecting" });
      expect(replace).toHaveBeenCalledWith("/");
    });

    it("reports ready and does not redirect when setup not required and no user", () => {
      setupQueryState = resolvedSetup(false);
      authState = withoutUser();

      const { result } = renderGate("login");

      expect(result.current).toEqual({ status: "ready" });
      expect(replace).not.toHaveBeenCalled();
    });

    it("ignores auth loading state and does not stay resolving on auth", () => {
      setupQueryState = resolvedSetup(false);
      authState = loadingAuth();

      const { result } = renderGate("login");

      expect(result.current).toEqual({ status: "ready" });
      expect(replace).not.toHaveBeenCalled();
    });

    it("reports error and does not redirect on query error", () => {
      setupQueryState = erroredSetup();
      authState = withoutUser();

      const { result } = renderGate("login");

      expect(result.current.status).toBe("error");
      expect(replace).not.toHaveBeenCalled();
    });

    it("does not enter error from an auth me error in the login context", () => {
      setupQueryState = resolvedSetup(false);
      authState = erroredAuth();

      const { result } = renderGate("login");

      expect(result.current.status).toBe("ready");
      expect(replace).not.toHaveBeenCalled();
    });
  });

  describe("context: setup", () => {
    it("redirects to / and reports redirecting when setup is no longer required", () => {
      setupQueryState = resolvedSetup(false);
      authState = withoutUser();

      const { result } = renderGate("setup");

      expect(result.current).toEqual({ status: "redirecting" });
      expect(replace).toHaveBeenCalledWith("/");
    });

    it("reports ready and does not redirect while setup is required", () => {
      setupQueryState = resolvedSetup(true);
      authState = withoutUser();

      const { result } = renderGate("setup");

      expect(result.current).toEqual({ status: "ready" });
      expect(replace).not.toHaveBeenCalled();
    });

    it("reports error and does not redirect on query error", () => {
      setupQueryState = erroredSetup();
      authState = withoutUser();

      const { result } = renderGate("setup");

      expect(result.current.status).toBe("error");
      expect(replace).not.toHaveBeenCalled();
    });

    it("reports resolving while the setup query is loading", () => {
      setupQueryState = loadingSetup();
      authState = withoutUser();

      const { result } = renderGate("setup");

      expect(result.current).toEqual({ status: "resolving" });
      expect(replace).not.toHaveBeenCalled();
    });
  });
});
