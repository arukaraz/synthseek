import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, render, screen } from "@test/test-utils";
import { createMockUser } from "@test/mocks/feature-hooks.mock";
import { DEFAULT_ACCESSIBILITY, type AccessibilitySettings } from "@modules/accessibility";

import { AccessibilityProvider } from "../AccessibilityProvider";
import { useAccessibility } from "../AccessibilityProvider";

type MutateOptions = { onSettled: () => void };

const auth = vi.hoisted(() => ({
  value: { currentUser: null, isLoading: false, isError: false, isAdmin: false, refetch: () => undefined } as {
    currentUser: { accessibility: AccessibilitySettings } | null;
    isLoading: boolean;
    isError: boolean;
    isAdmin: boolean;
    refetch: () => void;
  },
}));
const mutate = vi.hoisted(() => vi.fn<(input: unknown, options: MutateOptions) => void>());

vi.mock("@modules/providers/AuthProvider", () => ({ useAuthContext: () => auth.value }));
vi.mock("@hooks/api/mutations/auth/useUpdateAccessibility", () => ({ useUpdateAccessibility: () => ({ mutate }) }));

const ROOT_ATTRIBUTES = [
  "data-a11y-mode",
  "data-a11y-motion",
  "data-a11y-transparency",
  "data-a11y-contrast",
  "data-a11y-names",
];

const BOOT = { mode: false, motion: "auto", transparency: "auto", contrast: "auto", buttonNames: false } as const;

let latest: ReturnType<typeof useAccessibility> | null = null;

function Probe() {
  latest = useAccessibility();
  return <p data-testid="motion">{latest.motion}</p>;
}

function current(): ReturnType<typeof useAccessibility> {
  if (latest === null) throw new Error("probe did not render");
  return latest;
}

function rootAttributes(): Record<string, string | null> {
  return Object.fromEntries(ROOT_ATTRIBUTES.map((name) => [name, document.documentElement.getAttribute(name)]));
}

function clearCookies(): void {
  for (const name of ["a11y", "a11y_guest"]) document.cookie = `${name}=; Path=/; Max-Age=0`;
}

function signIn(accessibility: AccessibilitySettings): void {
  auth.value = { ...auth.value, currentUser: createMockUser({ accessibility }) };
}

beforeEach(() => {
  latest = null;
  mutate.mockReset();
  auth.value = { currentUser: null, isLoading: false, isError: false, isAdmin: false, refetch: () => undefined };
  for (const name of ROOT_ATTRIBUTES) document.documentElement.removeAttribute(name);
  clearCookies();
});

afterEach(clearCookies);

describe("AccessibilityProvider", () => {
  it("adds no attributes to the page at the defaults", () => {
    render(
      <AccessibilityProvider boot={BOOT}>
        <Probe />
      </AccessibilityProvider>
    );

    expect(rootAttributes()).toEqual({
      "data-a11y-mode": null,
      "data-a11y-motion": null,
      "data-a11y-transparency": null,
      "data-a11y-contrast": null,
      "data-a11y-names": null,
    });
    expect(current().mode).toBe(false);
  });

  it("starts from the cookie the server read for a guest", () => {
    document.cookie = "a11y=1.1.0.a.1; Path=/";
    render(
      <AccessibilityProvider
        boot={{ mode: true, motion: "on", transparency: "off", contrast: "auto", buttonNames: true }}
      >
        <Probe />
      </AccessibilityProvider>
    );

    expect(rootAttributes()).toMatchObject({
      "data-a11y-mode": "on",
      "data-a11y-motion": "on",
      "data-a11y-transparency": "off",
      "data-a11y-contrast": null,
      "data-a11y-names": "on",
    });
    expect(current().motion).toBe("on");
  });

  it("writes both cookies and no mutation when a guest changes a value", () => {
    render(
      <AccessibilityProvider boot={BOOT}>
        <Probe />
      </AccessibilityProvider>
    );

    act(() => current().update({ motion: "on", mode: true }));

    expect(mutate).not.toHaveBeenCalled();
    expect(document.cookie).toContain("a11y=1.1.a.a.0");
    expect(document.cookie).toContain("a11y_guest=1");
    expect(document.documentElement.getAttribute("data-a11y-motion")).toBe("on");
    expect(screen.getByTestId("motion")).toHaveTextContent("on");
  });

  it("follows the account once signed in and ignores the cookie", () => {
    signIn({ ...DEFAULT_ACCESSIBILITY, motion: "off", contrast: "on" });

    render(
      <AccessibilityProvider boot={{ ...BOOT, motion: "on" }}>
        <Probe />
      </AccessibilityProvider>
    );

    expect(rootAttributes()).toMatchObject({ "data-a11y-motion": "off", "data-a11y-contrast": "on" });
    expect(current().motion).toBe("off");
  });

  it("follows a change of the account after the first render", () => {
    signIn(DEFAULT_ACCESSIBILITY);
    const { rerender } = render(
      <AccessibilityProvider boot={BOOT}>
        <Probe />
      </AccessibilityProvider>
    );
    expect(document.documentElement.getAttribute("data-a11y-motion")).toBeNull();

    signIn({ ...DEFAULT_ACCESSIBILITY, motion: "on" });
    rerender(
      <AccessibilityProvider boot={BOOT}>
        <Probe />
      </AccessibilityProvider>
    );

    expect(document.documentElement.getAttribute("data-a11y-motion")).toBe("on");
  });

  it("applies a signed-in change at once and sends only the changed field", () => {
    signIn(DEFAULT_ACCESSIBILITY);
    render(
      <AccessibilityProvider boot={BOOT}>
        <Probe />
      </AccessibilityProvider>
    );

    act(() => current().update({ transparency: "on" }));

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toEqual({ accessibility: { transparency: "on" } });
    expect(document.documentElement.getAttribute("data-a11y-transparency")).toBe("on");
    expect(document.cookie).not.toContain("a11y=");
  });

  it("rolls the page back to the account when the save fails", () => {
    signIn(DEFAULT_ACCESSIBILITY);
    render(
      <AccessibilityProvider boot={BOOT}>
        <Probe />
      </AccessibilityProvider>
    );

    act(() => current().update({ motion: "on" }));
    expect(document.documentElement.getAttribute("data-a11y-motion")).toBe("on");

    act(() => mutate.mock.calls[0][1].onSettled());

    expect(document.documentElement.getAttribute("data-a11y-motion")).toBeNull();
    expect(current().motion).toBe("auto");
  });

  it("keeps a pending value while another save is still in flight", () => {
    signIn(DEFAULT_ACCESSIBILITY);
    render(
      <AccessibilityProvider boot={BOOT}>
        <Probe />
      </AccessibilityProvider>
    );

    act(() => current().update({ motion: "on" }));
    act(() => current().update({ contrast: "on" }));
    act(() => mutate.mock.calls[0][1].onSettled());

    expect(current().motion).toBe("on");

    act(() => mutate.mock.calls[1][1].onSettled());

    expect(current().motion).toBe("auto");
  });
});
