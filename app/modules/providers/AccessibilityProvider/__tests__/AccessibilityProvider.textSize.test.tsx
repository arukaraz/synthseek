import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, render } from "@test/test-utils";
import { createMockUser } from "@test/mocks/feature-hooks.mock";
import {
  DEFAULT_ACCESSIBILITY,
  TEXT_SIZE_ATTRIBUTE,
  TEXT_SIZE_COOKIE,
  type AccessibilitySettings,
} from "@modules/accessibility";

import { AccessibilityProvider, useAccessibility } from "../AccessibilityProvider";

const auth = vi.hoisted(() => ({
  value: { currentUser: null, isLoading: false, isError: false, isAdmin: false, refetch: () => undefined } as {
    currentUser: { accessibility: AccessibilitySettings } | null;
    isLoading: boolean;
    isError: boolean;
    isAdmin: boolean;
    refetch: () => void;
  },
}));
const mono = vi.hoisted(() => vi.fn<(enabled: boolean) => void>());

vi.mock("@modules/providers/AuthProvider", () => ({ useAuthContext: () => auth.value }));
vi.mock("@hooks/api/mutations/auth/useUpdateAccessibility", () => ({
  useUpdateAccessibility: () => ({ mutate: vi.fn() }),
}));
vi.mock("@hooks/ui/player/audio-graph", () => ({ setMonoAudio: mono }));

const BOOT = { mode: false, motion: "auto", transparency: "auto", contrast: "auto", buttonNames: false } as const;

let latest: ReturnType<typeof useAccessibility> | null = null;

function Probe() {
  latest = useAccessibility();
  return null;
}

function current(): ReturnType<typeof useAccessibility> {
  if (latest === null) throw new Error("probe did not render");
  return latest;
}

function clear(): void {
  document.cookie = `${TEXT_SIZE_COOKIE}=; Path=/; Max-Age=0`;
  document.documentElement.removeAttribute(TEXT_SIZE_ATTRIBUTE);
}

beforeEach(() => {
  latest = null;
  mono.mockReset();
  auth.value = { currentUser: null, isLoading: false, isError: false, isAdmin: false, refetch: () => undefined };
  clear();
});

afterEach(clear);

describe("the text size", () => {
  it("is normal, and leaves the page and the cookie alone, until someone changes it", () => {
    render(
      <AccessibilityProvider boot={BOOT}>
        <Probe />
      </AccessibilityProvider>
    );

    expect(current().textSize).toBe("normal");
    expect(document.documentElement.hasAttribute(TEXT_SIZE_ATTRIBUTE)).toBe(false);
    expect(document.cookie).not.toContain(TEXT_SIZE_COOKIE);
  });

  it("starts from the size the server read out of the cookie", () => {
    render(
      <AccessibilityProvider boot={BOOT} textSizeBoot="larger">
        <Probe />
      </AccessibilityProvider>
    );

    expect(current().textSize).toBe("larger");
  });

  it("writes the browser cookie and the root attribute at once, for a guest", () => {
    render(
      <AccessibilityProvider boot={BOOT}>
        <Probe />
      </AccessibilityProvider>
    );

    act(() => current().setTextSize("large"));

    expect(current().textSize).toBe("large");
    expect(document.documentElement.getAttribute(TEXT_SIZE_ATTRIBUTE)).toBe("large");
    expect(document.cookie).toContain(`${TEXT_SIZE_COOKIE}=large`);
  });

  it("keeps it per browser for a signed-in member, never sending it to the account", () => {
    auth.value = { ...auth.value, currentUser: createMockUser({ accessibility: { ...DEFAULT_ACCESSIBILITY } }) };
    render(
      <AccessibilityProvider boot={BOOT}>
        <Probe />
      </AccessibilityProvider>
    );

    act(() => current().setTextSize("largest"));

    expect(document.cookie).toContain(`${TEXT_SIZE_COOKIE}=largest`);
  });

  it("takes the attribute away again when the size goes back to normal", () => {
    render(
      <AccessibilityProvider boot={BOOT}>
        <Probe />
      </AccessibilityProvider>
    );
    act(() => current().setTextSize("large"));

    act(() => current().setTextSize("normal"));

    expect(document.documentElement.hasAttribute(TEXT_SIZE_ATTRIBUTE)).toBe(false);
  });
});

describe("mono audio", () => {
  it("tells the audio graph it is off at the defaults", () => {
    render(
      <AccessibilityProvider boot={BOOT}>
        <Probe />
      </AccessibilityProvider>
    );

    expect(mono).toHaveBeenLastCalledWith(false);
  });

  it("tells the audio graph when the member turns it on", () => {
    auth.value = {
      ...auth.value,
      currentUser: createMockUser({ accessibility: { ...DEFAULT_ACCESSIBILITY, monoAudio: true } }),
    };

    render(
      <AccessibilityProvider boot={BOOT}>
        <Probe />
      </AccessibilityProvider>
    );

    expect(mono).toHaveBeenLastCalledWith(true);
  });
});
