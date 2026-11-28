import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@test/mocks/next.mock";
import { createPlayerActions, createPlayerView } from "@test/factories";
import enPlayer from "@modules/i18n/messages/en/player.json";

import { PLAYBACK_PROBLEM_ID } from "../constants";
import { Player } from "../Player";
import type { PlayerView } from "../types";

class FakeResizeObserver {
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
}

const accessibility = vi.hoisted(() => ({ mode: false }));

vi.mock("@modules/providers/AccessibilityProvider", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@modules/providers/AccessibilityProvider")>();
  return { ...actual, useAccessibility: () => ({ ...actual.useAccessibility(), mode: accessibility.mode }) };
});

function renderPlayer(overrides: Partial<PlayerView> = {}) {
  const actions = createPlayerActions();
  const view = createPlayerView(overrides);
  const result = render(<Player view={view} actions={actions} />);
  return { ...result, actions, view };
}

beforeEach(() => {
  accessibility.mode = false;
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: !query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("a track that could not be played", () => {
  it("says so to assistive technology and ties the message to the play button", () => {
    renderPlayer({ failing: true });

    const message = screen.getByText(enPlayer.problem.playback);
    expect(message).toHaveAttribute("id", PLAYBACK_PROBLEM_ID);
    expect(screen.getByRole("button", { name: enPlayer.controls.play })).toHaveAccessibleDescription(
      enPlayer.problem.playback
    );
  });

  it("is not on screen for anyone without the accessibility mode, so the player looks as it does today", () => {
    renderPlayer({ failing: true });

    expect(screen.getByText(enPlayer.problem.playback)).not.toBeVisible();
  });

  it("is hidden rather than only moved off screen, so it is not loose text outside the page's regions", () => {
    renderPlayer({ failing: true });

    const message = screen.getByText(enPlayer.problem.playback);
    expect(message).toHaveAttribute("hidden");
    expect(screen.getByRole("button", { name: enPlayer.controls.play })).toHaveAccessibleDescription(
      enPlayer.problem.playback
    );
  });

  it("stays on screen in the accessibility mode", () => {
    accessibility.mode = true;
    renderPlayer({ failing: true });

    expect(screen.getByText(enPlayer.problem.playback)).toBeVisible();
  });

  it("is absent while nothing has failed", () => {
    renderPlayer({ failing: false });

    expect(screen.queryByText(enPlayer.problem.playback)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: enPlayer.controls.play })).not.toHaveAttribute("aria-describedby");
  });
});

describe("the full screen session and focus", () => {
  it("returns focus to the control that opened it, wherever that was", async () => {
    const opener = document.createElement("button");
    opener.textContent = "Play from the library";
    document.body.append(opener);
    opener.focus();
    const actions = createPlayerActions();
    const { rerender } = render(<Player view={createPlayerView({ fullscreen: true })} actions={actions} />);

    await waitFor(() => expect(opener).not.toHaveFocus());
    rerender(<Player view={createPlayerView({ fullscreen: false })} actions={actions} />);

    await waitFor(() => expect(opener).toHaveFocus());
  });
});
