import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import "@test/mocks/next.mock";
import { mockRouter } from "@test/mocks/next.mock";
import { createPlayerActions, createPlayerTrack, createPlayerView } from "@test/factories";
import enPlayer from "@modules/i18n/messages/en/player.json";

const mini = vi.hoisted(() => ({ ensureMiniHeight: vi.fn() }));

vi.mock("../miniWindow", () => ({
  ensureMiniHeight: mini.ensureMiniHeight,
  miniPlayerSupported: () => true,
  miniWindowBody: () => null,
  subscribeMiniWindow: () => () => undefined,
}));

import { MINI_COLLAPSED_HEIGHT_PX, MINI_EXTRAS_HEIGHT_PX, MINI_QUEUE_ROUTE } from "../constants";
import { MiniPlayer } from "../MiniPlayer";
import type { PlayerView } from "../types";

class FakeResizeObserver {
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
}

function renderMini(overrides: Partial<PlayerView> = {}) {
  const actions = createPlayerActions();
  const view = createPlayerView({ mode: "mini", ...overrides });
  render(<MiniPlayer view={view} actions={actions} />);
  return { actions, user: userEvent.setup() };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
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

describe("the detached mini player", () => {
  it("names the track and the artist in the small space it has", () => {
    renderMini();

    expect(screen.getAllByText("Digital Love").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Daft Punk").length).toBeGreaterThan(0);
  });

  it("keeps the transport within reach", async () => {
    const { actions, user } = renderMini();

    await user.click(screen.getByRole("button", { name: enPlayer.controls.play }));

    expect(actions.togglePlay).toHaveBeenCalled();
  });

  it("shows the elapsed time and the length", () => {
    renderMini({ positionSeconds: 65 });

    expect(screen.getByText("1:05")).toBeInTheDocument();
    expect(screen.getByText("5:01")).toBeInTheDocument();
  });

  it("keeps the extra controls folded away until they are asked for", () => {
    renderMini();

    expect(screen.getByRole("button", { name: enPlayer.mini.showControls })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("slider", { name: enPlayer.controls.volume })).not.toBeInTheDocument();
  });

  it("unfolds the extra controls and grows the window to fit them", async () => {
    const { user } = renderMini();

    await user.click(screen.getByRole("button", { name: enPlayer.mini.showControls }));

    expect(screen.getByRole("slider", { name: enPlayer.controls.volume })).toBeInTheDocument();
    expect(mini.ensureMiniHeight).toHaveBeenCalledWith(MINI_COLLAPSED_HEIGHT_PX + MINI_EXTRAS_HEIGHT_PX);
  });

  it("folds them away again and lets the window shrink back", async () => {
    const { user } = renderMini();
    await user.click(screen.getByRole("button", { name: enPlayer.mini.showControls }));

    await user.click(screen.getByRole("button", { name: enPlayer.mini.hideControls }));

    expect(mini.ensureMiniHeight).toHaveBeenLastCalledWith(MINI_COLLAPSED_HEIGHT_PX);
  });

  it("offers no mode menu, since the detached window is the mode", async () => {
    const { user } = renderMini();
    await user.click(screen.getByRole("button", { name: enPlayer.mini.showControls }));

    expect(screen.queryByRole("button", { name: enPlayer.controls.modes })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: enPlayer.controls.exitMini })).toBeInTheDocument();
  });

  it("gives the listener a way back to the normal player", async () => {
    const { actions, user } = renderMini();
    await user.click(screen.getByRole("button", { name: enPlayer.mini.showControls }));

    await user.click(screen.getByRole("button", { name: enPlayer.controls.exitMini }));

    expect(actions.selectMode).toHaveBeenCalledWith("normal");
  });

  it("shows the queue, which the detached window has no panel for", () => {
    renderMini({
      queue: {
        playing: { index: 0, track: createPlayerTrack() },
        upNext: [{ index: 1, track: createPlayerTrack({ id: "track-2", title: "Aerodynamic" }) }],
        autoplay: [],
      },
    });

    expect(screen.getByText(enPlayer.queue.nowPlaying)).toBeInTheDocument();
    expect(screen.getByText("Aerodynamic")).toBeInTheDocument();
  });

  it("sends the opener back to the library and brings it forward", async () => {
    const focus = vi.spyOn(window, "focus").mockImplementation(() => undefined);
    const { user } = renderMini();

    await user.click(screen.getByRole("button", { name: enPlayer.mini.openLibrary }));

    expect(mockRouter.push).toHaveBeenCalledWith(MINI_QUEUE_ROUTE);
    expect(focus).toHaveBeenCalled();
    focus.mockRestore();
  });
});
