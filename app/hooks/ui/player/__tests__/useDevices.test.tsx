import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEVICE_HEARTBEAT_MS, HAND_OVER_ACK_MS, PROGRESS_REPORT_MS, WAKE_BEAT_FLOOR_MS } from "../constants";
import type { KnownDevice, PlayerSessionState, RemotePlayback } from "../types";

interface CommandResult {
  delivered: boolean;
  issuedAt: number | null;
}

interface ActiveSnapshot {
  deviceId: string;
  deviceName: string;
  playing: boolean;
  track: { id: string; title: string } | null;
  positionSeconds: number;
  reportedSecondsAgo: number;
  shuffle: boolean;
  repeat: "off" | "all" | "one";
  volume: number;
  muted: boolean;
  transcoding: boolean;
}

const api = vi.hoisted(() => ({
  known: [] as KnownDevice[],
  commandResult: { delivered: true, issuedAt: 1 } as CommandResult,
  commandFails: false,
  saveFails: false,
  active: undefined as ActiveSnapshot | null | undefined,
  refetchActive: vi.fn(async () => ({ data: null })),
  heartbeat: vi.fn(),
  forget: vi.fn(),
  save: vi.fn(),
  command: vi.fn(),
  publish: vi.fn(),
}));

vi.mock("@hooks/api", () => ({
  useActivePlayback: () => ({ data: api.active, refetch: api.refetchActive }),
  useDeviceHeartbeat: () => ({
    mutate: (input: unknown, options?: { onSuccess?: (known: KnownDevice[]) => void }) => {
      api.heartbeat(input);
      options?.onSuccess?.(api.known);
    },
  }),
  useForgetDevice: () => ({ mutate: api.forget }),
  useSavePlaybackSession: () => ({
    mutate: (input: unknown, options?: { onSuccess?: () => void; onError?: () => void }) => {
      api.save(input);
      if (api.saveFails) options?.onError?.();
      else options?.onSuccess?.();
    },
  }),
  useSendPlayerCommand: () => ({
    mutate: (input: unknown, options?: { onSuccess?: (result: CommandResult) => void; onError?: () => void }) => {
      api.command(input);
      if (api.commandFails) options?.onError?.();
      else options?.onSuccess?.(api.commandResult);
    },
  }),
  usePublishPlaybackState: () => ({ mutate: api.publish }),
}));

const device = vi.hoisted(() => ({
  release: vi.fn(),
  replaced: null as ((id: string) => void) | null,
}));

vi.mock("../device", () => ({
  claimDeviceId: (onReplaced: (id: string) => void) => {
    device.replaced = onReplaced;
    return device.release;
  },
  deviceIdentity: () => ({ id: "here", name: "Web Player (Chrome)", kind: "computer" }),
}));

const commands = vi.hoisted(() => ({ adoptSharedQueue: vi.fn(), noteCommandIssued: vi.fn() }));

vi.mock("../commands", () => commands);

const store = vi.hoisted(() => ({
  listeners: new Set<() => void>(),
  snapshot: sessionState(),
  saved: { trackIds: [] as string[], currentTrackId: null as string | null, positionMs: 0 },
  applyRemoteState: vi.fn(),
  forgetRemote: vi.fn(),
  announceDeviceGone: vi.fn(),
  recoverUnconfirmedHandOver: vi.fn(),
  resync: vi.fn(),
}));

vi.mock("../store", () => ({
  actions: {
    applyRemoteState: store.applyRemoteState,
    forgetRemote: store.forgetRemote,
    announceDeviceGone: store.announceDeviceGone,
    recoverUnconfirmedHandOver: store.recoverUnconfirmedHandOver,
    resync: store.resync,
  },
  getSnapshot: () => store.snapshot,
  sessionSnapshot: () => ({ ...store.saved, trackIds: [...store.saved.trackIds] }),
  subscribe: (listener: () => void) => {
    store.listeners.add(listener);
    return () => {
      store.listeners.delete(listener);
    };
  },
}));

import { usePlayerDevices } from "../useDevices";

function sessionState(overrides: Partial<PlayerSessionState> = {}): PlayerSessionState {
  return {
    queue: [],
    index: 0,
    playing: false,
    loading: false,
    positionSeconds: 0,
    durationSeconds: 0,
    scrubSeconds: null,
    volume: 0.8,
    muted: false,
    shuffle: false,
    shuffleOrder: [],
    repeat: "off",
    transcoding: false,
    armed: false,
    remote: null,
    offsetSeconds: 0,
    chainVisible: false,
    devicesOpen: false,
    settingsOpen: false,
    equalizer: { enabled: false, gainsDb: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], preampDb: 0 },
    equalizerPresets: [],
    compressor: { enabled: false, thresholdDb: -24, ratio: 4, attackMs: 20, releaseMs: 300, kneeDb: 3 },
    conversion: { enabled: false, bitrateKbps: 192 },
    transition: { mode: "gapless", seconds: 5, curve: "equalPower" },
    modesOpen: false,
    queueOpen: false,
    mode: "normal",
    lyricsOpen: false,
    fullscreen: false,
    consecutiveFailures: 0,
    started: false,
    ...overrides,
  };
}

function knownDevice(id: string, overrides: Partial<KnownDevice> = {}): KnownDevice {
  return { id, name: `Device ${id}`, kind: "computer", armed: true, playing: false, trackTitle: null, ...overrides };
}

function remote(overrides: Partial<RemotePlayback> = {}): RemotePlayback {
  return {
    deviceId: "kitchen",
    deviceName: "Kitchen",
    confirmed: true,
    playing: true,
    track: null,
    positionSeconds: 0,
    shuffle: false,
    repeat: "off",
    volume: 1,
    muted: false,
    transcoding: false,
    updatedAt: Date.now(),
    ...overrides,
  };
}

function publish(): void {
  act(() => {
    store.listeners.forEach((listener) => listener());
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  store.listeners.clear();
  store.snapshot = sessionState();
  store.saved = { trackIds: [], currentTrackId: null, positionMs: 0 };
  api.known = [];
  api.active = undefined;
  api.commandResult = { delivered: true, issuedAt: 1 };
  api.commandFails = false;
  api.saveFails = false;
  api.refetchActive.mockResolvedValue({ data: null });
  device.replaced = null;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("announcing this device", () => {
  it("says hello as soon as the player mounts", () => {
    renderHook(() => usePlayerDevices());

    expect(api.heartbeat).toHaveBeenCalledWith(
      expect.objectContaining({ deviceId: "here", name: "Web Player (Chrome)", kind: "computer" })
    );
  });

  it("carries what this device is doing, so another tab can label it", () => {
    store.snapshot = sessionState({
      armed: true,
      playing: true,
      queue: [
        {
          id: "t1",
          title: "Digital Love",
          artist: "Daft Punk",
          album: "Discovery",
          durationSeconds: 300,
          format: "mp3",
          bitrateKbps: 320,
          lossless: false,
          tone: "primary",
          artworkUrl: null,
          albumId: "album-1",
          replayGain: { trackGain: null, albumGain: null, trackPeak: null, albumPeak: null },
        },
      ],
    });

    renderHook(() => usePlayerDevices());

    expect(api.heartbeat).toHaveBeenCalledWith(
      expect.objectContaining({ armed: true, playing: true, trackTitle: "Digital Love" })
    );
  });

  it("keeps saying hello on a beat", () => {
    renderHook(() => usePlayerDevices());
    api.heartbeat.mockClear();

    act(() => {
      vi.advanceTimersByTime(DEVICE_HEARTBEAT_MS);
    });

    expect(api.heartbeat).toHaveBeenCalledTimes(1);
  });

  it("leaves itself out of the list of other devices", () => {
    api.known = [knownDevice("here"), knownDevice("kitchen")];

    const { result } = renderHook(() => usePlayerDevices());

    expect(result.current.devices.map((entry) => entry.id)).toEqual(["kitchen"]);
  });

  it("announces under a fresh id once another tab turns out to hold the one it claimed", () => {
    renderHook(() => usePlayerDevices());
    api.heartbeat.mockClear();

    act(() => {
      device.replaced?.("fresh");
    });
    act(() => {
      vi.advanceTimersByTime(DEVICE_HEARTBEAT_MS);
    });

    expect(api.heartbeat).toHaveBeenCalledWith(expect.objectContaining({ deviceId: "fresh" }));
  });

  it("stands down and hands the claim back when the player goes away", () => {
    const { unmount } = renderHook(() => usePlayerDevices());

    unmount();

    expect(device.release).toHaveBeenCalled();
  });

  it("tells the server it is leaving so it does not linger in the device list", () => {
    renderHook(() => usePlayerDevices());

    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });

    expect(api.forget).toHaveBeenCalledWith({ deviceId: "here" });
  });

  it("reports the sound stopping on the way out, so another device does not mirror a closed tab", () => {
    store.snapshot = sessionState({ playing: true });
    renderHook(() => usePlayerDevices());
    api.publish.mockClear();

    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });

    expect(api.publish).toHaveBeenCalledWith(expect.objectContaining({ playing: false }));
  });

  it("says nothing about playback on the way out when it was already silent", () => {
    renderHook(() => usePlayerDevices());
    api.publish.mockClear();

    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });

    expect(api.publish).not.toHaveBeenCalled();
  });
});

describe("waking back up", () => {
  it("catches up the mirrored clock and re-announces itself when the tab returns", () => {
    renderHook(() => usePlayerDevices());
    api.heartbeat.mockClear();
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });

    act(() => {
      vi.advanceTimersByTime(WAKE_BEAT_FLOOR_MS + 1);
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(store.resync).toHaveBeenCalled();
    expect(api.heartbeat).toHaveBeenCalled();
    expect(api.refetchActive).toHaveBeenCalled();
  });

  it("ignores the tab being hidden", () => {
    renderHook(() => usePlayerDevices());
    api.heartbeat.mockClear();
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });

    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(store.resync).not.toHaveBeenCalled();
    expect(api.heartbeat).not.toHaveBeenCalled();
  });

  it("does not stampede the server when the tab was only away for a moment", () => {
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    renderHook(() => usePlayerDevices());
    api.heartbeat.mockClear();

    act(() => {
      window.dispatchEvent(new Event("focus"));
      window.dispatchEvent(new Event("pageshow"));
    });

    expect(store.resync).toHaveBeenCalledTimes(2);
    expect(api.heartbeat).not.toHaveBeenCalled();
  });
});

describe("reporting what this device is playing", () => {
  it("reports the position on a beat while it is playing", () => {
    store.snapshot = sessionState({ playing: true, positionSeconds: 30 });
    renderHook(() => usePlayerDevices());
    api.publish.mockClear();

    act(() => {
      vi.advanceTimersByTime(PROGRESS_REPORT_MS);
    });

    expect(api.publish).toHaveBeenCalledWith(expect.objectContaining({ playing: true, positionSeconds: 30 }));
  });

  it("stays quiet on the beat while nothing is playing", () => {
    renderHook(() => usePlayerDevices());
    api.publish.mockClear();

    act(() => {
      vi.advanceTimersByTime(PROGRESS_REPORT_MS);
    });

    expect(api.publish).not.toHaveBeenCalled();
  });

  it("reports the moment the sound starts rather than waiting for the next beat", () => {
    renderHook(() => usePlayerDevices());
    api.publish.mockClear();
    store.snapshot = sessionState({ playing: true });

    publish();

    expect(api.publish).toHaveBeenCalledWith(expect.objectContaining({ playing: true }));
  });

  it("says nothing when nothing worth reporting has changed", () => {
    renderHook(() => usePlayerDevices());
    publish();
    api.publish.mockClear();

    publish();

    expect(api.publish).not.toHaveBeenCalled();
  });

  it("reports a volume change, which another device mirrors", () => {
    renderHook(() => usePlayerDevices());
    publish();
    api.publish.mockClear();
    store.snapshot = sessionState({ volume: 0.2 });

    publish();

    expect(api.publish).toHaveBeenCalledWith(expect.objectContaining({ volume: 0.2 }));
  });

  it("reports a seek, which is a jump the projected position cannot explain", () => {
    store.snapshot = sessionState({ playing: true });
    renderHook(() => usePlayerDevices());
    publish();
    api.publish.mockClear();

    store.snapshot = sessionState({ playing: true, positionSeconds: 120 });
    publish();

    expect(api.publish).toHaveBeenCalledWith(expect.objectContaining({ positionSeconds: 120 }));
  });

  it("re-announces itself when a device it has never heard of takes the sound", () => {
    renderHook(() => usePlayerDevices());
    api.heartbeat.mockClear();
    store.snapshot = sessionState({ remote: remote({ deviceId: "stranger" }) });

    publish();

    expect(api.heartbeat).toHaveBeenCalled();
  });

  it("stops forcing a beat once the server's own list names that device", () => {
    renderHook(() => usePlayerDevices());
    api.known = [knownDevice("stranger")];
    store.snapshot = sessionState({ remote: remote({ deviceId: "stranger" }) });
    publish();
    api.heartbeat.mockClear();

    publish();

    expect(api.heartbeat).not.toHaveBeenCalled();
  });
});

describe("mirroring the active device", () => {
  it("mirrors a device that is playing somewhere else", () => {
    api.active = {
      deviceId: "kitchen",
      deviceName: "Kitchen",
      playing: true,
      track: { id: "t1", title: "Digital Love" },
      positionSeconds: 40,
      reportedSecondsAgo: 2,
      shuffle: false,
      repeat: "off",
      volume: 0.6,
      muted: false,
      transcoding: false,
    };

    renderHook(() => usePlayerDevices());

    expect(store.applyRemoteState).toHaveBeenCalledWith(
      expect.objectContaining({ deviceId: "kitchen", confirmed: true, positionSeconds: 42 })
    );
    expect(commands.adoptSharedQueue).toHaveBeenCalledWith("t1");
  });

  it("does not mirror its own report back onto itself", () => {
    api.active = {
      deviceId: "here",
      deviceName: "Here",
      playing: true,
      track: null,
      positionSeconds: 0,
      reportedSecondsAgo: 0,
      shuffle: false,
      repeat: "off",
      volume: 1,
      muted: false,
      transcoding: false,
    };

    renderHook(() => usePlayerDevices());

    expect(store.applyRemoteState).not.toHaveBeenCalled();
  });

  it("ignores a device that reports itself as not playing", () => {
    api.active = {
      deviceId: "kitchen",
      deviceName: "Kitchen",
      playing: false,
      track: null,
      positionSeconds: 0,
      reportedSecondsAgo: 0,
      shuffle: false,
      repeat: "off",
      volume: 1,
      muted: false,
      transcoding: false,
    };

    renderHook(() => usePlayerDevices());

    expect(store.applyRemoteState).not.toHaveBeenCalled();
  });

  it("ignores an empty active-playback answer", () => {
    api.active = null;

    renderHook(() => usePlayerDevices());

    expect(store.applyRemoteState).not.toHaveBeenCalled();
  });
});

describe("commanding the device that holds the sound", () => {
  it("sends nothing when no device is being mirrored", () => {
    const { result } = renderHook(() => usePlayerDevices());

    act(() => {
      result.current.commandActive("play");
    });

    expect(api.command).not.toHaveBeenCalled();
  });

  it("carries the seek position with a seek command", () => {
    store.snapshot = sessionState({ remote: remote() });
    const { result } = renderHook(() => usePlayerDevices());

    act(() => {
      result.current.commandActive("seek", 90);
    });

    expect(api.command).toHaveBeenCalledWith({
      deviceId: "kitchen",
      command: "seek",
      seekSeconds: 90,
      volumeLevel: undefined,
    });
  });

  it("carries the level with a volume command", () => {
    store.snapshot = sessionState({ remote: remote() });
    const { result } = renderHook(() => usePlayerDevices());

    act(() => {
      result.current.commandActive("setVolume", 0.3);
    });

    expect(api.command).toHaveBeenCalledWith({
      deviceId: "kitchen",
      command: "setVolume",
      seekSeconds: undefined,
      volumeLevel: 0.3,
    });
  });

  it("remembers when the command was issued, so a stale report cannot undo it", () => {
    store.snapshot = sessionState({ remote: remote() });
    api.commandResult = { delivered: true, issuedAt: 1234 };
    const { result } = renderHook(() => usePlayerDevices());

    act(() => {
      result.current.commandActive("pause");
    });

    expect(commands.noteCommandIssued).toHaveBeenCalledWith(1234);
  });

  it("lets go of a device that never received the command", () => {
    store.snapshot = sessionState({ remote: remote() });
    api.commandResult = { delivered: false, issuedAt: null };
    const { result } = renderHook(() => usePlayerDevices());

    act(() => {
      result.current.commandActive("pause");
    });

    expect(store.forgetRemote).toHaveBeenCalled();
    expect(api.refetchActive).toHaveBeenCalled();
  });
});

describe("controlling another device from the list", () => {
  it("asks a playing device to pause and shows it paused straight away", () => {
    api.known = [knownDevice("kitchen", { playing: true })];
    const { result } = renderHook(() => usePlayerDevices());

    act(() => {
      result.current.toggleRemote("kitchen", true);
    });

    expect(api.command).toHaveBeenCalledWith({ deviceId: "kitchen", command: "pause" });
    expect(result.current.devices[0]?.playing).toBe(false);
  });

  it("asks a paused device to play", () => {
    api.known = [knownDevice("kitchen")];
    const { result } = renderHook(() => usePlayerDevices());

    act(() => {
      result.current.toggleRemote("kitchen", false);
    });

    expect(api.command).toHaveBeenCalledWith({ deviceId: "kitchen", command: "play" });
  });

  it("drops a device that is no longer there and says so", () => {
    api.known = [knownDevice("kitchen")];
    api.commandResult = { delivered: false, issuedAt: null };
    const { result } = renderHook(() => usePlayerDevices());

    act(() => {
      result.current.toggleRemote("kitchen", false);
    });

    expect(result.current.devices).toHaveLength(0);
    expect(store.announceDeviceGone).toHaveBeenCalled();
  });
});

describe("handing the sound to another device", () => {
  it("refuses when there is nothing to hand over", () => {
    const { result } = renderHook(() => usePlayerDevices());

    act(() => {
      result.current.handOverTo("kitchen");
    });

    expect(api.save).not.toHaveBeenCalled();
    expect(api.command).not.toHaveBeenCalled();
  });

  it("saves the queue before asking the other device to pick it up", () => {
    store.saved = { trackIds: ["a"], currentTrackId: "a", positionMs: 0 };
    api.known = [knownDevice("kitchen", { name: "Kitchen" })];
    const { result } = renderHook(() => usePlayerDevices());

    act(() => {
      result.current.handOverTo("kitchen");
    });

    expect(api.save).toHaveBeenCalledWith({ trackIds: ["a"], currentTrackId: "a", positionMs: 0 });
    expect(api.command).toHaveBeenCalledWith({ deviceId: "kitchen", command: "handOver" });
  });

  it("shows the other device as holding the sound before it has confirmed", () => {
    store.saved = { trackIds: ["a"], currentTrackId: "a", positionMs: 0 };
    api.known = [knownDevice("kitchen", { name: "Kitchen" })];
    const { result } = renderHook(() => usePlayerDevices());

    act(() => {
      result.current.handOverTo("kitchen");
    });

    expect(store.applyRemoteState).toHaveBeenCalledWith(
      expect.objectContaining({ confirmed: false, deviceId: "kitchen", deviceName: "Kitchen" })
    );
  });

  it("falls back to the device id when it has no name to show", () => {
    store.saved = { trackIds: ["a"], currentTrackId: "a", positionMs: 0 };
    const { result } = renderHook(() => usePlayerDevices());

    act(() => {
      result.current.handOverTo("unnamed");
    });

    expect(store.applyRemoteState).toHaveBeenCalledWith(expect.objectContaining({ deviceName: "unnamed" }));
  });

  it("passes a mirrored session on without saving a queue it does not hold", () => {
    store.snapshot = sessionState({ remote: remote() });
    const { result } = renderHook(() => usePlayerDevices());

    act(() => {
      result.current.handOverTo("study");
    });

    expect(api.save).not.toHaveBeenCalled();
    expect(api.command).toHaveBeenCalledWith({ deviceId: "study", command: "handOver" });
    expect(store.applyRemoteState).not.toHaveBeenCalled();
  });

  it("takes the sound back when the other device never picked it up", () => {
    store.saved = { trackIds: ["a"], currentTrackId: "a", positionMs: 0 };
    const { result } = renderHook(() => usePlayerDevices());

    act(() => {
      result.current.handOverTo("kitchen");
    });
    expect(store.recoverUnconfirmedHandOver).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(HAND_OVER_ACK_MS);
    });

    expect(store.recoverUnconfirmedHandOver).toHaveBeenCalledWith("kitchen");
  });

  it("takes the sound back at once when the command was never delivered", () => {
    store.saved = { trackIds: ["a"], currentTrackId: "a", positionMs: 0 };
    api.known = [knownDevice("kitchen")];
    api.commandResult = { delivered: false, issuedAt: null };
    const { result } = renderHook(() => usePlayerDevices());

    act(() => {
      result.current.handOverTo("kitchen");
    });

    expect(store.recoverUnconfirmedHandOver).toHaveBeenCalledWith("kitchen");
    expect(result.current.devices).toHaveLength(0);
  });

  it("takes the sound back when the command itself failed", () => {
    store.saved = { trackIds: ["a"], currentTrackId: "a", positionMs: 0 };
    api.commandFails = true;
    const { result } = renderHook(() => usePlayerDevices());

    act(() => {
      result.current.handOverTo("kitchen");
    });

    expect(store.recoverUnconfirmedHandOver).toHaveBeenCalledWith("kitchen");
  });

  it("takes the sound back when the queue could not be saved, since the other device would find nothing", () => {
    store.saved = { trackIds: ["a"], currentTrackId: "a", positionMs: 0 };
    api.saveFails = true;
    const { result } = renderHook(() => usePlayerDevices());

    act(() => {
      result.current.handOverTo("kitchen");
    });

    expect(api.command).not.toHaveBeenCalled();
    expect(store.recoverUnconfirmedHandOver).toHaveBeenCalledWith("kitchen");
  });

  it("drops a pending acknowledgement timer when the player goes away", () => {
    store.saved = { trackIds: ["a"], currentTrackId: "a", positionMs: 0 };
    const { result, unmount } = renderHook(() => usePlayerDevices());
    act(() => {
      result.current.handOverTo("kitchen");
    });

    unmount();
    act(() => {
      vi.advanceTimersByTime(HAND_OVER_ACK_MS * 2);
    });

    expect(store.recoverUnconfirmedHandOver).not.toHaveBeenCalled();
  });
});
