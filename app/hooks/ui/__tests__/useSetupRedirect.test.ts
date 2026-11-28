import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
  data: { required: boolean; tokenRequired: boolean } | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

interface AuthShape {
  currentUser: { id: string } | null;
  isAdmin: boolean;
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

const resolvedSetup = (value: boolean, tokenRequired = false): SetupQueryShape => ({
  data: { required: value, tokenRequired },
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
  isAdmin: true,
  isLoading: false,
  isError: false,
  refetch: authRefetch,
});
const withoutUser = (): AuthShape => ({
  currentUser: null,
  isAdmin: false,
  isLoading: false,
  isError: false,
  refetch: authRefetch,
});
const loadingAuth = (): AuthShape => ({
  currentUser: null,
  isAdmin: false,
  isLoading: true,
  isError: false,
  refetch: authRefetch,
});
const erroredAuth = (): AuthShape => ({
  currentUser: null,
  isAdmin: false,
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

  afterEach(() => {
    window.history.replaceState({}, "", "/");
  });

  describe("the shape of the setup status", () => {
    it("does not treat a token requirement alone as setup being required", () => {
      setupQueryState = resolvedSetup(false, true);
      authState = withUser();

      const { result } = renderGate("app");

      expect(result.current).toEqual({ status: "ready" });
      expect(replace).not.toHaveBeenCalled();
    });

    it("sends the visitor to first-run setup when the status says it is required, token or not", () => {
      setupQueryState = resolvedSetup(true, true);
      authState = withoutUser();

      renderGate("login");

      expect(replace).toHaveBeenCalledWith("/setup");
    });
  });

  describe("the return path", () => {
    it("carries the deep link a signed-out visitor asked for to the sign-in", () => {
      window.history.replaceState({}, "", "/library?tab=albums#top");
      authState = withoutUser();

      renderGate("app");

      expect(replace).toHaveBeenCalledWith(`/login?next=${encodeURIComponent("/library?tab=albums#top")}`);
    });

    it("carries the oauth consent grant to the sign-in", () => {
      window.history.replaceState({}, "", "/oauth/consent?grant=g-1");
      authState = withoutUser();

      renderGate("app");

      expect(replace).toHaveBeenCalledWith(`/login?next=${encodeURIComponent("/oauth/consent?grant=g-1")}`);
    });

    it("sends a signed-in visitor on the sign-in page to the path they asked for", () => {
      window.history.replaceState({}, "", `/login?next=${encodeURIComponent("/oauth/consent?grant=g-1")}`);
      authState = withUser();

      renderGate("login");

      expect(replace).toHaveBeenCalledWith("/oauth/consent?grant=g-1");
    });

    it("sends a signed-in visitor home when the requested path is hostile", () => {
      window.history.replaceState({}, "", "/login?next=%2F%2Fevil.example");
      authState = withUser();

      renderGate("login");

      expect(replace).toHaveBeenCalledWith("/");
    });
  });

  describe("context: app", () => {
    it("redirects to /setup for the account question when setup is required, nobody exists and a token is waiting", () => {
      setupQueryState = resolvedSetup(true, true);
      authState = withoutUser();

      const { result } = renderGate("app");

      expect(result.current).toEqual({ status: "redirecting" });
      expect(replace).toHaveBeenCalledWith("/setup");
    });

    it("sends a signed-out visitor to sign in, returning to /setup, when the account already exists and setup is unfinished", () => {
      setupQueryState = resolvedSetup(true, false);
      authState = withoutUser();

      const { result } = renderGate("app");

      expect(result.current).toEqual({ status: "redirecting" });
      expect(replace).toHaveBeenCalledWith("/login?next=%2Fsetup");
    });

    it("lets a signed-in visitor into the app while setup is unfinished, so abandoning it never traps them", () => {
      setupQueryState = resolvedSetup(true, false);
      authState = withUser();

      const { result } = renderGate("app");

      expect(result.current).toEqual({ status: "ready" });
      expect(replace).not.toHaveBeenCalled();
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
    it("redirects to /setup and reports redirecting when setup is required and the account is still to be created", () => {
      setupQueryState = resolvedSetup(true, true);
      authState = withoutUser();

      const { result } = renderGate("login");

      expect(result.current).toEqual({ status: "redirecting" });
      expect(replace).toHaveBeenCalledWith("/setup");
    });

    it("stays on the sign-in when setup is unfinished but the account exists, so the setup page can send visitors here without a loop", () => {
      setupQueryState = resolvedSetup(true, false);
      authState = withoutUser();

      const { result } = renderGate("login");

      expect(result.current).toEqual({ status: "ready" });
      expect(replace).not.toHaveBeenCalled();
    });

    it("returns a visitor who signed in for the setup to /setup", () => {
      window.history.replaceState({}, "", "/login?next=%2Fsetup");
      setupQueryState = resolvedSetup(true, false);
      authState = withUser();

      renderGate("login");

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

    it("reports ready for the account question when setup is required and a token is waiting", () => {
      setupQueryState = resolvedSetup(true, true);
      authState = withoutUser();

      const { result } = renderGate("setup");

      expect(result.current).toEqual({ status: "ready" });
      expect(replace).not.toHaveBeenCalled();
    });

    it("sends a signed-out visitor to sign in, returning to the question they were on, when the account exists", () => {
      window.history.replaceState({}, "", "/setup?question=media");
      setupQueryState = resolvedSetup(true, false);
      authState = withoutUser();

      const { result } = renderGate("setup");

      expect(result.current).toEqual({ status: "redirecting" });
      expect(replace).toHaveBeenCalledWith(`/login?next=${encodeURIComponent("/setup?question=media")}`);
    });

    it("reports ready for a signed-in administrator while setup is required", () => {
      setupQueryState = resolvedSetup(true, false);
      authState = withUser();

      const { result } = renderGate("setup");

      expect(result.current).toEqual({ status: "ready" });
      expect(replace).not.toHaveBeenCalled();
    });

    it("sends a signed-in member home, since only an administrator can answer the questions", () => {
      setupQueryState = resolvedSetup(true, false);
      authState = { ...withUser(), isAdmin: false };

      const { result } = renderGate("setup");

      expect(result.current).toEqual({ status: "redirecting" });
      expect(replace).toHaveBeenCalledWith("/");
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
