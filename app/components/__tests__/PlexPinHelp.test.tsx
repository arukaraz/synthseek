import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "@modules/i18n";
import enComponents from "@modules/i18n/messages/en/components.json";

import { PlexPinHelp } from "../PlexPinHelp";

const accessibility = vi.hoisted(() => ({ mode: true }));

vi.mock("@modules/providers/AccessibilityProvider", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@modules/providers/AccessibilityProvider")>();
  return { ...actual, useAccessibility: () => ({ ...actual.useAccessibility(), mode: accessibility.mode }) };
});

const copy = enComponents.a11yMode.plex;
const START = new Date("2026-11-27T10:00:00.000Z").getTime();
const session = { authUrl: "https://app.plex.tv/auth#?code=ABCD", expiresAt: START + 120_000 };

beforeEach(async () => {
  await i18n.changeLanguage("en");
  accessibility.mode = true;
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
  vi.setSystemTime(START);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("PlexPinHelp", () => {
  it("shows nothing with the mode off", () => {
    accessibility.mode = false;

    const { container } = render(<PlexPinHelp session={session} phase="pending" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows nothing when no sign-in is waiting", () => {
    const { container } = render(<PlexPinHelp session={null} phase="idle" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("offers to copy the link while a sign-in waits", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<PlexPinHelp session={session} phase="pending" />);

    await act(async () => {
      screen.getByRole("button", { name: copy.copy }).click();
    });

    expect(writeText).toHaveBeenCalledWith(session.authUrl);
    expect(screen.getByRole("button", { name: copy.copied })).toBeInTheDocument();
  });

  it("says nothing about expiry until thirty seconds are left", () => {
    render(<PlexPinHelp session={session} phase="pending" />);

    expect(screen.getByRole("status")).toHaveTextContent("");

    act(() => {
      vi.advanceTimersByTime(89_000);
    });
    expect(screen.getByRole("status")).toHaveTextContent("");

    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(screen.getByRole("status")).toHaveTextContent(copy.expiring);
  });

  it("warns at once when the sign-in is already close to expiring", () => {
    render(<PlexPinHelp session={{ ...session, expiresAt: START + 20_000 }} phase="pending" />);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(screen.getByRole("status")).toHaveTextContent(copy.expiring);
  });
});
