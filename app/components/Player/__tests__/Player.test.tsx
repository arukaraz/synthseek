import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import "@test/mocks/next.mock";
import { createPlayerActions, createPlayerDevice, createPlayerTrack, createPlayerView } from "@test/factories";
import enPlayer from "@modules/i18n/messages/en/player.json";

import { PLAYER_HEADER_SLOT_ID } from "../constants";
import { Player } from "../Player";
import type { PlayerView } from "../types";

class FakeResizeObserver {
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
}

let wideScreen = true;

function stubMatchMedia(): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? false : wideScreen,
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

function renderPlayer(overrides: Partial<PlayerView> = {}) {
  const actions = createPlayerActions();
  const view = createPlayerView(overrides);
  const result = render(<Player view={view} actions={actions} />);
  return { ...result, actions, view, user: userEvent.setup() };
}

beforeEach(() => {
  wideScreen = true;
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  stubMatchMedia();
});

describe("the player dock", () => {
  it("names the track, the artist and the album it is playing", () => {
    renderPlayer();

    expect(screen.getByText("Digital Love")).toBeInTheDocument();
    expect(screen.getByText("Daft Punk")).toBeInTheDocument();
    expect(screen.getByText("· Discovery", { exact: false })).toBeInTheDocument();
  });

  it("shows where the sound is coming out", () => {
    renderPlayer();

    expect(screen.getAllByText("This browser").length).toBeGreaterThan(0);
  });

  it("shows the elapsed time and the length of the track", () => {
    renderPlayer({ positionSeconds: 65 });

    expect(screen.getByText("1:05")).toBeInTheDocument();
    expect(screen.getByText("5:01")).toBeInTheDocument();
  });

  it("offers play while the track is paused", async () => {
    const { actions, user } = renderPlayer();

    await user.click(screen.getByRole("button", { name: enPlayer.controls.play }));

    expect(actions.togglePlay).toHaveBeenCalled();
  });

  it("offers pause while the track is sounding", () => {
    renderPlayer({ playing: true });

    expect(screen.getByRole("button", { name: enPlayer.controls.pause })).toBeInTheDocument();
  });

  it("shows a spinner rather than a transport face while the stream is loading", () => {
    renderPlayer({ loading: true });

    const transport = screen.getByRole("button", { name: enPlayer.controls.play });
    expect(transport.querySelector(".animate-spin")).not.toBeNull();
  });

  it("shows the transport face again once the stream is ready", () => {
    renderPlayer();

    const transport = screen.getByRole("button", { name: enPlayer.controls.play });
    expect(transport.querySelector(".animate-spin")).toBeNull();
  });

  it("steps through the queue in both directions", async () => {
    const { actions, user } = renderPlayer();

    await user.click(screen.getByRole("button", { name: enPlayer.controls.next }));
    await user.click(screen.getByRole("button", { name: enPlayer.controls.previous }));

    expect(actions.next).toHaveBeenCalled();
    expect(actions.previous).toHaveBeenCalled();
  });

  it("marks shuffle as pressed only while it is on", async () => {
    const { user, actions } = renderPlayer();
    const shuffle = screen.getAllByRole("button", { name: enPlayer.controls.shuffle })[0];
    expect(shuffle).toHaveAttribute("aria-pressed", "false");

    if (shuffle !== undefined) await user.click(shuffle);
    expect(actions.toggleShuffle).toHaveBeenCalled();
  });

  it("names the repeat mode it will move to", () => {
    renderPlayer({ repeat: "one" });

    expect(screen.getAllByRole("button", { name: enPlayer.controls.repeat.one }).length).toBeGreaterThan(0);
  });

  it("opens the full stage from the cover", async () => {
    const { actions, user } = renderPlayer();

    await user.click(screen.getByRole("button", { name: enPlayer.controls.openTrack }));

    expect(actions.toggleFullscreen).toHaveBeenCalled();
  });

  it("marks the track as a favourite", async () => {
    const { actions, user } = renderPlayer();

    await user.click(screen.getAllByRole("button", { name: enPlayer.controls.favorite })[0] ?? document.body);

    expect(actions.toggleFavorite).toHaveBeenCalled();
  });

  it("offers to un-favourite a track already marked", () => {
    renderPlayer({ favorite: true });

    expect(screen.getAllByRole("button", { name: enPlayer.controls.unfavorite }).length).toBeGreaterThan(0);
  });

  it("asks for a better copy of the track", async () => {
    const { actions, user } = renderPlayer();

    await user.click(screen.getAllByRole("button", { name: enPlayer.controls.upgrade })[0] ?? document.body);

    expect(actions.searchBetterQuality).toHaveBeenCalled();
  });

  it("refuses a second upgrade while one is already running", () => {
    renderPlayer({ upgrading: true });

    expect(screen.getAllByRole("button", { name: enPlayer.controls.upgrade })[0]).toBeDisabled();
  });

  it("keeps the signal chain hidden until it is asked for", () => {
    renderPlayer();

    expect(screen.queryByText(enPlayer.chain.output)).not.toBeInTheDocument();
  });

  it("spells out the chain from the file to the speakers when it is opened", () => {
    renderPlayer({ chainVisible: true });

    expect(screen.getByText(enPlayer.chain.file)).toBeInTheDocument();
    expect(screen.getByText(enPlayer.chain.server)).toBeInTheDocument();
    expect(screen.getByText(enPlayer.chain.output)).toBeInTheDocument();
    expect(screen.getByText("FLAC 1024 kbps")).toBeInTheDocument();
  });

  it("falls back to the album initials when there is no artwork", () => {
    renderPlayer();

    expect(screen.getAllByText("D").length).toBeGreaterThan(0);
  });

  it("shows the artwork when the track has some", () => {
    renderPlayer({ track: createPlayerTrack({ artworkUrl: "/art/cover.jpg" }) });

    expect(screen.getByRole("presentation")).toHaveAttribute("src", expect.stringContaining("cover.jpg"));
  });
});

describe("the scrobbling indicator", () => {
  it("reports the state without offering a press when no service is connected", () => {
    renderPlayer();

    expect(screen.getAllByRole("status", { name: enPlayer.scrobble.off }).length).toBeGreaterThan(0);
  });

  it("offers a press once a service is connected", async () => {
    const { actions, user } = renderPlayer({ scrobble: "sending", scrobbleActionable: true });

    const toggle = screen.getAllByRole("button", { name: enPlayer.scrobble.sending })[0];
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    if (toggle !== undefined) await user.click(toggle);

    expect(actions.toggleScrobbling).toHaveBeenCalled();
  });

  it("shows a failing service as failed rather than as sending", () => {
    renderPlayer({ scrobble: "failed", scrobbleActionable: true });

    expect(screen.getAllByRole("button", { name: enPlayer.scrobble.failed }).length).toBeGreaterThan(0);
  });
});

describe("the device menu", () => {
  it("lists this browser and the devices the server knows", () => {
    const kitchen = createPlayerDevice({ id: "kitchen", name: "Kitchen", local: false, active: false, kind: "phone" });
    renderPlayer({ devicesOpen: true, devices: [createPlayerDevice(), kitchen] });

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("This browser")).toBeInTheDocument();
    expect(within(dialog).getByText("Kitchen")).toBeInTheDocument();
  });

  it("does not offer to move the sound to the device that already has it", () => {
    renderPlayer({ devicesOpen: true });

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).queryByRole("button", { name: /This browser/ })).not.toBeInTheDocument();
  });

  it("hands the sound to another device", async () => {
    const kitchen = createPlayerDevice({ id: "kitchen", name: "Kitchen", local: false, active: false });
    const { actions, user } = renderPlayer({ devicesOpen: true, devices: [createPlayerDevice(), kitchen] });

    await user.click(screen.getByRole("button", { name: `${enPlayer.devices.handOver}: Kitchen` }));

    expect(actions.handOverTo).toHaveBeenCalledWith("kitchen");
  });

  it("takes the sound back to this browser", async () => {
    const here = createPlayerDevice({ active: false });
    const kitchen = createPlayerDevice({ id: "kitchen", name: "Kitchen", local: false, active: true });
    const { actions, user } = renderPlayer({ devicesOpen: true, devices: [here, kitchen], activeDevice: kitchen });

    await user.click(screen.getByRole("button", { name: `${enPlayer.devices.playHere}: This browser` }));

    expect(actions.playHere).toHaveBeenCalled();
  });
});

describe("the mode menu", () => {
  it("offers the modes the player can be moved into, and not the one it is already in", () => {
    renderPlayer({ modesOpen: true });

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(enPlayer.modes.caption)).toBeInTheDocument();
    expect(within(dialog).getByText(enPlayer.modes.compact)).toBeInTheDocument();
    expect(within(dialog).getByText(enPlayer.modes.mini)).toBeInTheDocument();
    expect(within(dialog).getAllByRole("button")).toHaveLength(2);
  });

  it("refuses mini on a browser that cannot detach a window, and says why", () => {
    renderPlayer({ modesOpen: true });

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(enPlayer.modes.unsupported)).toBeInTheDocument();
    expect(within(dialog).getByText(enPlayer.modes.mini).closest("button")).toBeDisabled();
  });

  it("switches to the mode the listener picked", async () => {
    const { actions, user } = renderPlayer({ modesOpen: true });

    const dialog = screen.getByRole("dialog");
    const compact = within(dialog).getByText(enPlayer.modes.compact).closest("button");
    if (compact !== null) await user.click(compact);

    expect(actions.selectMode).toHaveBeenCalledWith("compact");
  });
});

describe("the queue panel", () => {
  const upNext = [
    { index: 1, track: createPlayerTrack({ id: "track-2", title: "Aerodynamic" }) },
    { index: 2, track: createPlayerTrack({ id: "track-3", title: "Veridis Quo" }) },
  ];

  it("separates what is playing from what is still to come", () => {
    renderPlayer({
      queueOpen: true,
      queue: { playing: { index: 0, track: createPlayerTrack() }, upNext, autoplay: [] },
    });

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(enPlayer.queue.nowPlaying)).toBeInTheDocument();
    expect(within(dialog).getByText(enPlayer.queue.upNext)).toBeInTheDocument();
    expect(within(dialog).getByText("Aerodynamic")).toBeInTheDocument();
  });

  it("says the queue is empty rather than showing an empty list", () => {
    renderPlayer({
      queueOpen: true,
      queue: { playing: { index: 0, track: createPlayerTrack() }, upNext: [], autoplay: [] },
    });

    expect(within(screen.getByRole("dialog")).getByText(enPlayer.queue.empty)).toBeInTheDocument();
  });

  it("jumps to a track the listener picked out of the queue", async () => {
    const { actions, user } = renderPlayer({
      queueOpen: true,
      queue: { playing: { index: 0, track: createPlayerTrack() }, upNext, autoplay: [] },
    });

    await user.click(screen.getByRole("button", { name: enPlayer.queue.jumpTo.replace("{{title}}", "Veridis Quo") }));

    expect(actions.jumpTo).toHaveBeenCalledWith(2);
  });

  it("drops a track out of the queue", async () => {
    const { actions, user } = renderPlayer({
      queueOpen: true,
      queue: { playing: { index: 0, track: createPlayerTrack() }, upNext, autoplay: [] },
    });

    await user.click(screen.getByRole("button", { name: enPlayer.queue.remove.replace("{{title}}", "Aerodynamic") }));

    expect(actions.removeFromQueue).toHaveBeenCalledWith(1);
  });

  it("offers no reordering or removal while another device owns the queue", () => {
    renderPlayer({
      queueOpen: true,
      queueEditable: false,
      queue: { playing: { index: 0, track: createPlayerTrack() }, upNext, autoplay: [] },
    });

    expect(
      screen.queryByRole("button", { name: enPlayer.queue.remove.replace("{{title}}", "Aerodynamic") })
    ).not.toBeInTheDocument();
  });

  it("closes the panel", async () => {
    const { actions, user } = renderPlayer({
      queueOpen: true,
      queue: { playing: { index: 0, track: createPlayerTrack() }, upNext, autoplay: [] },
    });

    await user.click(screen.getByRole("button", { name: enPlayer.queue.close }));

    expect(actions.toggleQueue).toHaveBeenCalled();
  });

  it("keeps the queue panel out of the way of the full stage", () => {
    renderPlayer({ queueOpen: true, fullscreen: true });

    expect(screen.queryByText(enPlayer.queue.title)).not.toBeInTheDocument();
  });
});

describe("the full stage", () => {
  it("gives the track the whole screen", () => {
    renderPlayer({ fullscreen: true });

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getAllByRole("heading", { name: "Digital Love" })).toHaveLength(2);
    expect(within(dialog).getByText("Discovery")).toBeInTheDocument();
    expect(within(dialog).getByText("Daft Punk")).toBeInTheDocument();
  });

  it("spells out what is being streamed and what the server is doing", () => {
    renderPlayer({ fullscreen: true });

    expect(screen.getByText("FLAC 1024 kbps")).toBeInTheDocument();
    expect(screen.getByText(enPlayer.stage.serverChip.replace("{{value}}", "Direct"))).toBeInTheDocument();
  });

  it("names the device when the sound is somewhere else", () => {
    const kitchen = createPlayerDevice({ id: "kitchen", name: "Kitchen", local: false });
    renderPlayer({ fullscreen: true, activeDevice: kitchen, devices: [kitchen] });

    expect(screen.getByText("Kitchen")).toBeInTheDocument();
  });

  it("leaves the stage", async () => {
    const { actions, user } = renderPlayer({ fullscreen: true });

    await user.click(screen.getByRole("button", { name: enPlayer.controls.fullscreenClose }));

    expect(actions.toggleFullscreen).toHaveBeenCalled();
  });

  it("turns the stage over to the lyrics", async () => {
    const { actions, user } = renderPlayer({ fullscreen: true });

    await user.click(screen.getByRole("button", { name: enPlayer.controls.lyrics }));

    expect(actions.toggleLyrics).toHaveBeenCalled();
  });

  it("offers the volume on the stage, which the dock keeps for wider screens", () => {
    renderPlayer({ fullscreen: true });

    expect(screen.getAllByRole("slider", { name: enPlayer.controls.volume }).length).toBeGreaterThan(0);
  });

  it("hides the dock while the stage is up, so only one transport is on screen", () => {
    const { container } = renderPlayer({ fullscreen: true });

    expect(container.querySelector("[data-cy=player]")).toBeNull();
  });
});

describe("the lyrics pane", () => {
  it("says it is still fetching rather than showing nothing", () => {
    renderPlayer({ fullscreen: true, lyricsOpen: true, lyricsLoading: true });

    expect(screen.getByText(enPlayer.lyrics.loading)).toBeInTheDocument();
  });

  it("says the track has no lyrics once the fetch is done", () => {
    renderPlayer({ fullscreen: true, lyricsOpen: true });

    expect(screen.getByText(enPlayer.lyrics.empty)).toBeInTheDocument();
  });

  it("shows the reason the lyrics could not be fetched", () => {
    renderPlayer({ fullscreen: true, lyricsOpen: true, lyricsFailure: "Lyrics provider unreachable" });

    expect(screen.getByText("Lyrics provider unreachable")).toBeInTheDocument();
  });

  it("seeks to the line the listener presses when the lyrics are timed", async () => {
    const { actions, user } = renderPlayer({
      fullscreen: true,
      lyricsOpen: true,
      lyrics: {
        synced: true,
        lines: [
          { start: 0, value: "Last night I had a dream about you" },
          { start: 12_000, value: "In this dream I'm dancing right beside you" },
        ],
      },
    });

    await user.click(screen.getByRole("button", { name: "In this dream I'm dancing right beside you" }));

    expect(actions.seekTo).toHaveBeenCalledWith(12);
  });

  it("offers no seeking on lyrics that carry no timings, and says they are untimed", () => {
    renderPlayer({
      fullscreen: true,
      lyricsOpen: true,
      lyrics: { synced: false, lines: [{ start: null, value: "Last night I had a dream about you" }] },
    });

    expect(screen.getByText(enPlayer.lyrics.untimed)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Last night I had a dream about you" })).not.toBeInTheDocument();
  });

  it("closes the lyrics", async () => {
    const { actions, user } = renderPlayer({ fullscreen: true, lyricsOpen: true });

    await user.click(screen.getByRole("button", { name: enPlayer.controls.lyricsClose }));

    expect(actions.toggleLyrics).toHaveBeenCalled();
  });
});

describe("compact mode", () => {
  it("moves the bar into the header slot when the screen is wide enough", () => {
    const slot = document.createElement("div");
    slot.id = PLAYER_HEADER_SLOT_ID;
    document.body.appendChild(slot);

    renderPlayer({ mode: "compact" });

    expect(within(slot).getByText("Digital Love")).toBeInTheDocument();
    slot.remove();
  });

  it("falls back to the dock when the header has no slot to lend", () => {
    const { container } = renderPlayer({ mode: "compact" });

    expect(container.querySelector("[data-cy=player]")).not.toBeNull();
  });

  it("falls back to the dock on a screen too narrow for the header slot", () => {
    const slot = document.createElement("div");
    slot.id = PLAYER_HEADER_SLOT_ID;
    document.body.appendChild(slot);
    wideScreen = false;

    const { container } = renderPlayer({ mode: "compact" });

    expect(container.querySelector("[data-cy=player]")).not.toBeNull();
    slot.remove();
  });

  it("marks the document with the mode the player settled on", () => {
    renderPlayer({ mode: "compact" });

    expect(document.documentElement.getAttribute("data-player-mode")).toBe("normal");
  });

  it("hangs the signal chain under the header, since the dock that used to carry it is gone", () => {
    const slot = document.createElement("div");
    slot.id = PLAYER_HEADER_SLOT_ID;
    document.body.appendChild(slot);

    renderPlayer({ mode: "compact", chainVisible: true });

    expect(screen.getByText(enPlayer.chain.server)).toBeInTheDocument();
    expect(within(slot).queryByText(enPlayer.chain.server)).not.toBeInTheDocument();
    slot.remove();
  });
});

describe("the playback settings", () => {
  it("open from the bar", async () => {
    const { actions, user } = renderPlayer();

    await user.click(screen.getAllByRole("button", { name: enPlayer.controls.settings })[0] ?? document.body);

    expect(actions.toggleSettings).toHaveBeenCalled();
  });

  it("take their place in the signal chain as the EQ stage, named with its state, and open from there too", async () => {
    const { actions, user, view } = renderPlayer({ chainVisible: true });

    expect(screen.getByText(enPlayer.chain.equalizer)).toBeInTheDocument();
    const stage = screen.getByRole("button", {
      name: `${enPlayer.controls.settings}: ${view.chain.equalizerLabel}`,
    });
    await user.click(stage);

    expect(actions.toggleSettings).toHaveBeenCalled();
  });

  it("show the curve in play in the chain once the equaliser is on", () => {
    const chain = { ...createPlayerView().chain, equalizerLabel: "Rock · -5 dB", equalizerActive: true };
    renderPlayer({ chainVisible: true, chain });

    expect(screen.getByText("Rock · -5 dB")).toBeInTheDocument();
  });

  it("show the panel with a slider per band when they are open", () => {
    renderPlayer({ settingsOpen: true });

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(enPlayer.settings.title)).toBeInTheDocument();
    expect(within(dialog).getAllByRole("slider", { name: /Hz band/ })).toHaveLength(10);
  });

  it("keep the equaliser on the stage, as a chip and as a control", () => {
    renderPlayer({ fullscreen: true });

    expect(screen.getByText(enPlayer.stage.equalizerChip.replace("{{value}}", "off"))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: enPlayer.controls.settings })).toBeInTheDocument();
  });
});
