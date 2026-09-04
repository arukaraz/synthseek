import { beforeEach, describe, expect, it, vi } from "vitest";

import { SubscriptionEventType } from "@api/__generated__/types";

const store = vi.hoisted(() => ({
  actions: {
    resumeHere: vi.fn(),
    pauseHere: vi.fn(),
    togglePlay: vi.fn(),
    next: vi.fn(),
    previous: vi.fn(),
    seekTo: vi.fn(),
    toggleShuffle: vi.fn(),
    cycleRepeat: vi.fn(),
    toggleMute: vi.fn(),
    setVolume: vi.fn(),
    applyRemoteState: vi.fn(),
  },
}));
const device = vi.hoisted(() => ({ deviceIdentity: vi.fn(() => ({ id: "mine", name: "Chrome on Linux" })) }));

vi.mock("../store", () => store);
vi.mock("../device", () => device);

import { applyPlaybackState, applyPlayerCommand, noteCommandIssued, setTakeOverHandler } from "../commands";

function command(overrides: Partial<Parameters<typeof applyPlayerCommand>[0]>) {
  return {
    eventType: SubscriptionEventType.PlayerCommand,
    userId: "u1",
    deviceId: "mine",
    issuedAt: Date.now(),
    command: "pause" as const,
    ...overrides,
  };
}

beforeEach(() => {
  for (const fn of Object.values(store.actions)) fn.mockReset();
  setTakeOverHandler(null);
});

describe("applyPlayerCommand", () => {
  it("ignores a command addressed to another device", () => {
    applyPlayerCommand(command({ deviceId: "somebody-else" }));

    expect(store.actions.pauseHere).not.toHaveBeenCalled();
  });

  it("pauses on pause and resumes on play, rather than toggling either way", () => {
    applyPlayerCommand(command({ command: "pause", issuedAt: 1_000 }));
    applyPlayerCommand(command({ command: "play", issuedAt: 2_000 }));

    expect(store.actions.pauseHere).toHaveBeenCalledTimes(1);
    expect(store.actions.resumeHere).toHaveBeenCalledTimes(1);
    expect(store.actions.togglePlay).not.toHaveBeenCalled();
  });

  it("acts on two identical commands in a row, because each is a separate press", () => {
    applyPlayerCommand(command({ command: "pause", issuedAt: 3_000 }));
    applyPlayerCommand(command({ command: "pause", issuedAt: 4_000 }));

    expect(store.actions.pauseHere).toHaveBeenCalledTimes(2);
  });

  it("drops a command that arrives out of order", () => {
    applyPlayerCommand(command({ command: "pause", issuedAt: 9_000 }));
    applyPlayerCommand(command({ command: "play", issuedAt: 8_000 }));

    expect(store.actions.resumeHere).not.toHaveBeenCalled();
  });

  it("hands a take-over to whoever registered for it, and stops when nobody has", () => {
    const takeOver = vi.fn();
    setTakeOverHandler(takeOver);
    applyPlayerCommand(command({ command: "handOver", issuedAt: 10_000 }));
    expect(takeOver).toHaveBeenCalledTimes(1);

    setTakeOverHandler(null);
    applyPlayerCommand(command({ command: "handOver", issuedAt: 11_000 }));
    expect(takeOver).toHaveBeenCalledTimes(1);
  });
});

describe("applyPlayerCommand, every member", () => {
  it("skips to the next track", () => {
    applyPlayerCommand(command({ command: "next", issuedAt: 20_000 }));
    expect(store.actions.next).toHaveBeenCalledTimes(1);
  });

  it("steps back to the previous track", () => {
    applyPlayerCommand(command({ command: "previous", issuedAt: 21_000 }));
    expect(store.actions.previous).toHaveBeenCalledTimes(1);
  });

  it("seeks to the second it was given, and ignores a seek with no second", () => {
    applyPlayerCommand(command({ command: "seek", seekSeconds: 42, issuedAt: 22_000 }));
    expect(store.actions.seekTo).toHaveBeenCalledWith(42);

    applyPlayerCommand(command({ command: "seek", issuedAt: 23_000 }));
    expect(store.actions.seekTo).toHaveBeenCalledTimes(1);
  });

  it("toggles shuffle, repeat and mute through their own actions", () => {
    applyPlayerCommand(command({ command: "toggleShuffle", issuedAt: 24_000 }));
    applyPlayerCommand(command({ command: "cycleRepeat", issuedAt: 25_000 }));
    applyPlayerCommand(command({ command: "toggleMute", issuedAt: 26_000 }));

    expect(store.actions.toggleShuffle).toHaveBeenCalledTimes(1);
    expect(store.actions.cycleRepeat).toHaveBeenCalledTimes(1);
    expect(store.actions.toggleMute).toHaveBeenCalledTimes(1);
  });

  it("sets the volume it was given, and ignores one with no level", () => {
    applyPlayerCommand(command({ command: "setVolume", volumeLevel: 0.25, issuedAt: 27_000 }));
    expect(store.actions.setVolume).toHaveBeenCalledWith(0.25);

    applyPlayerCommand(command({ command: "setVolume", issuedAt: 28_000 }));
    expect(store.actions.setVolume).toHaveBeenCalledTimes(1);
  });
});

describe("noteCommandIssued", () => {
  function announcement(issuedAt: number) {
    return {
      eventType: SubscriptionEventType.PlaybackState,
      userId: "u1",
      deviceId: "somebody-else",
      deviceName: "Web Player (Firefox)",
      playing: true,
      track: null,
      positionSeconds: 10,
      shuffle: false,
      repeat: "off" as const,
      volume: 0.8,
      muted: false,
      transcoding: false,
      issuedAt,
    };
  }

  it("drops what the other device said before it heard our command, so an optimistic control does not flicker back", () => {
    noteCommandIssued(50_000);
    applyPlaybackState(announcement(49_000));

    expect(store.actions.applyRemoteState).not.toHaveBeenCalled();
  });

  it("still applies what it says afterwards", () => {
    noteCommandIssued(60_000);
    applyPlaybackState(announcement(61_000));

    expect(store.actions.applyRemoteState).toHaveBeenCalledTimes(1);
  });
});
