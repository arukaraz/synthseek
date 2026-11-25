import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import "@test/mocks/next.mock";
import { createPlayerActions, createPlayerView } from "@test/factories";
import enPlayer from "@modules/i18n/messages/en/player.json";

import {
  LYRICS_AUTO_SCROLL_STORAGE_KEY,
  STAGE_CHIPS_STORAGE_KEY,
  STAGE_IDLE_MS,
  STAGE_IMMERSIVE_QUERY,
} from "../constants";
import { Player } from "../Player";
import type { PlayerView } from "../types";

class FakeResizeObserver {
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
}

let desktop = true;

function stubMatchMedia(): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches:
        !query.includes("prefers-reduced-motion") &&
        !query.includes("max-height") &&
        (query !== STAGE_IMMERSIVE_QUERY || desktop),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

const timedLyrics: PlayerView["lyrics"] = {
  synced: true,
  lines: [
    { start: 0, value: "Last night I had a dream about you" },
    { start: 12_000, value: "In this dream I'm dancing right beside you" },
  ],
};

function renderStage(overrides: Partial<PlayerView> = {}) {
  const actions = createPlayerActions();
  const view = createPlayerView({ fullscreen: true, ...overrides });
  const result = render(<Player view={view} actions={actions} />);
  return { ...result, actions, view, user: userEvent.setup() };
}

function equalizerChip(): HTMLElement | null {
  return screen.queryByText(/^EQ: /);
}

function releaseOpeningFocus(): void {
  const focused = document.activeElement;
  if (focused instanceof HTMLElement) act(() => focused.blur());
}

function visibleTitles(): HTMLElement[] {
  const dialogTitle = screen.getByRole("dialog").getAttribute("aria-labelledby");
  return screen.queryAllByRole("heading", { level: 2 }).filter((heading) => heading.id !== dialogTitle);
}

beforeEach(() => {
  desktop = true;
  window.localStorage.clear();
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  stubMatchMedia();
});

describe("the full screen stage on a desktop", () => {
  it("keeps the title and the cover beside the lyrics instead of flipping them away", () => {
    renderStage({ lyricsOpen: true, lyrics: timedLyrics });

    expect(visibleTitles()).toHaveLength(1);
    expect(screen.getByRole("button", { name: "In this dream I'm dancing right beside you" })).toBeInTheDocument();
  });

  it("flips the lyrics in place of the title below the desktop width, as before", () => {
    desktop = false;
    renderStage({ lyricsOpen: true, lyrics: timedLyrics });

    expect(visibleTitles()).toHaveLength(0);
  });

  it("hides the file, server and EQ chips together from the info button and remembers it", async () => {
    const { user } = renderStage();
    expect(equalizerChip()).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: enPlayer.stage.chipsHide }));

    await waitFor(() => expect(equalizerChip()).not.toBeInTheDocument());
    expect(screen.queryByText(/^server: /)).not.toBeInTheDocument();
    expect(window.localStorage.getItem(STAGE_CHIPS_STORAGE_KEY)).toBe("hidden");
    expect(screen.getByRole("button", { name: enPlayer.stage.chipsShow })).toHaveAttribute("aria-pressed", "false");
  });

  it("starts with the chips hidden when this browser hid them before", () => {
    window.localStorage.setItem(STAGE_CHIPS_STORAGE_KEY, "hidden");
    renderStage();

    expect(equalizerChip()).not.toBeInTheDocument();
  });

  it("turns lyric auto-scroll off and remembers it in this browser", async () => {
    const { user } = renderStage({ lyricsOpen: true, lyrics: timedLyrics });
    const toggle = screen.getByRole("switch", { name: enPlayer.lyrics.autoScroll });

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(window.localStorage.getItem(LYRICS_AUTO_SCROLL_STORAGE_KEY)).toBe("off");
  });

  it("shows the auto-scroll switch in the header only while the lyrics are open", () => {
    const { rerender, actions } = renderStage();
    expect(screen.queryByRole("switch", { name: enPlayer.lyrics.autoScroll })).not.toBeInTheDocument();

    rerender(
      <Player view={createPlayerView({ fullscreen: true, lyricsOpen: true, lyrics: timedLyrics })} actions={actions} />
    );

    expect(screen.getByRole("switch", { name: enPlayer.lyrics.autoScroll })).toBeInTheDocument();
  });

  it("hides the header and the footer after a quiet while playing, and brings them back on any movement", () => {
    vi.useFakeTimers();
    try {
      const { container } = renderStage({ playing: true });
      const main = () => container.ownerDocument.querySelector("[data-stage-idle]");
      releaseOpeningFocus();
      expect(main()).toHaveAttribute("data-stage-idle", "false");

      act(() => vi.advanceTimersByTime(STAGE_IDLE_MS));
      expect(main()).toHaveAttribute("data-stage-idle", "true");
      expect(screen.getByRole("button", { name: enPlayer.controls.pause })).toBeInTheDocument();

      act(() => {
        fireEvent.pointerMove(window);
      });
      expect(main()).toHaveAttribute("data-stage-idle", "false");
    } finally {
      vi.useRealTimers();
    }
  });

  it("wakes when focus moves, and stays awake while a keyboard focus sits on the controls", () => {
    vi.useFakeTimers();
    try {
      renderStage({ playing: true });
      const main = () => document.querySelector("[data-stage-idle]");
      releaseOpeningFocus();
      act(() => vi.advanceTimersByTime(STAGE_IDLE_MS));
      expect(main()).toHaveAttribute("data-stage-idle", "true");

      act(() => {
        screen.getByRole("button", { name: enPlayer.queue.title }).focus();
      });
      expect(main()).toHaveAttribute("data-stage-idle", "false");

      act(() => {
        fireEvent.keyDown(window, { key: "Tab" });
      });
      act(() => vi.advanceTimersByTime(STAGE_IDLE_MS * 2));
      expect(main()).toHaveAttribute("data-stage-idle", "false");

      act(() => {
        fireEvent.pointerDown(window);
      });
      act(() => vi.advanceTimersByTime(STAGE_IDLE_MS));
      expect(main()).toHaveAttribute("data-stage-idle", "true");
    } finally {
      vi.useRealTimers();
    }
  });

  it("stays awake while paused, while a menu is open, or while another dialog sits over the stage", () => {
    vi.useFakeTimers();
    try {
      const paused = renderStage({ playing: false });
      act(() => vi.advanceTimersByTime(STAGE_IDLE_MS * 2));
      expect(document.querySelector("[data-stage-idle]")).toHaveAttribute("data-stage-idle", "false");
      paused.unmount();

      const menu = document.createElement("div");
      menu.setAttribute("role", "menu");
      document.body.appendChild(menu);
      renderStage({ playing: true });
      act(() => vi.advanceTimersByTime(STAGE_IDLE_MS * 2));
      expect(document.querySelector("[data-stage-idle]")).toHaveAttribute("data-stage-idle", "false");
      menu.remove();
      cleanup();

      const confirmation = document.createElement("div");
      confirmation.setAttribute("role", "dialog");
      document.body.appendChild(confirmation);
      renderStage({ playing: true });
      act(() => vi.advanceTimersByTime(STAGE_IDLE_MS * 2));
      expect(document.querySelector("[data-stage-idle]")).toHaveAttribute("data-stage-idle", "false");
      confirmation.remove();
    } finally {
      vi.useRealTimers();
    }
  });

  it("opens the queue as a column beside the track, where the lyrics go", () => {
    renderStage({ queueOpen: true });

    expect(screen.getByRole("complementary", { name: enPlayer.queue.title })).toBeInTheDocument();
  });

  it("closes the open queue or lyrics column first, and only then the stage on Escape", async () => {
    const queued = renderStage({ queueOpen: true });
    await queued.user.keyboard("{Escape}");
    expect(queued.actions.toggleQueue).toHaveBeenCalledTimes(1);
    expect(queued.actions.toggleLyrics).not.toHaveBeenCalled();
    expect(queued.actions.toggleFullscreen).not.toHaveBeenCalled();
    queued.unmount();

    const reading = renderStage({ lyricsOpen: true, lyrics: timedLyrics });
    await reading.user.keyboard("{Escape}");
    expect(reading.actions.toggleLyrics).toHaveBeenCalledTimes(1);
    expect(reading.actions.toggleFullscreen).not.toHaveBeenCalled();
    reading.unmount();

    const bare = renderStage();
    await bare.user.keyboard("{Escape}");
    expect(bare.actions.toggleFullscreen).toHaveBeenCalledTimes(1);
  });

  it("keeps the transport, the waveform and the volume of today's stage", () => {
    renderStage();

    expect(screen.getByRole("slider", { name: enPlayer.controls.seek })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: enPlayer.controls.stop })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: enPlayer.controls.volume })).toBeInTheDocument();
  });

  it("moves radio, settings and devices into the more menu of the stage header", async () => {
    const { user } = renderStage();

    await user.click(screen.getByRole("button", { name: enPlayer.controls.more }));

    expect(await screen.findByRole("menuitem", { name: enPlayer.menu.startRadio })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: enPlayer.controls.settings })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: new RegExp(enPlayer.controls.devices) })).toBeInTheDocument();
  });
});
