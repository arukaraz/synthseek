import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import type { UsePlexPinPopupOptions, UsePlexPinPopupResult } from "@hooks/ui/types";

interface PlexLinkResolved {
  plexUsername: string | null;
}

interface CapturedOptions {
  options?: UsePlexPinPopupOptions<PlexLinkResolved>;
}

const spies = vi.hoisted(() => {
  const captured: CapturedOptions = {};
  const pinPopupResult: UsePlexPinPopupResult = {
    start: vi.fn(),
    reset: vi.fn(),
    phase: "idle",
    isPending: false,
  };
  return {
    startFlow: vi.fn(),
    poll: vi.fn(),
    invalidateMe: vi.fn().mockResolvedValue(undefined),
    success: vi.fn(),
    captured,
    pinPopupResult,
  };
});

vi.mock("@hooks/api/mutations/auth/usePlexLinkFlow", () => ({
  usePlexLinkFlow: () => ({ start: spies.startFlow, poll: spies.poll }),
}));

vi.mock("@hooks/ui/usePlexPinPopup", () => ({
  usePlexPinPopup: (options: UsePlexPinPopupOptions<PlexLinkResolved>) => {
    spies.captured.options = options;
    return spies.pinPopupResult;
  },
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({ auth: { me: { invalidate: spies.invalidateMe } } }),
  },
}));

vi.mock("sonner", () => ({
  toast: { success: spies.success },
}));

import { usePlexLink } from "../usePlexLink";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  vi.clearAllMocks();
  spies.captured.options = undefined;
});

describe("usePlexLink", () => {
  it("returns the pin popup result", () => {
    const { result } = renderHook(() => usePlexLink());
    expect(result.current).toBe(spies.pinPopupResult);
  });

  it("wires the flow start and poll into the pin popup", () => {
    renderHook(() => usePlexLink());
    expect(spies.captured.options?.start).toBe(spies.startFlow);
    expect(spies.captured.options?.poll).toBe(spies.poll);
  });

  it("threads the localized timeout and error messages", () => {
    renderHook(() => usePlexLink());
    expect(spies.captured.options?.timeoutMessage).toBe(enSettings.profile.connected.plex.linkTimedOut);
    expect(spies.captured.options?.errorFallbackMessage).toBe(enSettings.profile.connected.plex.linkFailed);
  });

  it("invalidates the current user and toasts the linked username on resolve", async () => {
    renderHook(() => usePlexLink());
    await spies.captured.options?.onResolved({ plexUsername: "alice" });

    expect(spies.invalidateMe).toHaveBeenCalledTimes(1);
    expect(spies.success).toHaveBeenCalledWith(
      enSettings.profile.connected.plex.linkedAs.replace("{{username}}", "alice")
    );
  });

  it("toasts the fallback message when no username is resolved", async () => {
    renderHook(() => usePlexLink());
    await spies.captured.options?.onResolved({ plexUsername: null });

    expect(spies.success).toHaveBeenCalledWith(enSettings.profile.connected.plex.linkedFallback);
  });
});
