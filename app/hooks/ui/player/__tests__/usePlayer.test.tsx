import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enPlayer from "@modules/i18n/messages/en/player.json";

import type { PlayerTrack } from "@components/Player";

import type { KnownDevice, ListeningConnectionStatus, PlayerSessionState, RemotePlayback } from "../types";

vi.mock("@components/Player", async () => {
  const helpers = await vi.importActual<typeof import("@components/Player/helpers")>("@components/Player/helpers");
  return { nextRepeat: helpers.nextRepeat };
});

const api = vi.hoisted(() => ({
  favorites: [] as string[],
  connections: [] as ListeningConnectionStatus[],
  lyrics: { data: undefined as unknown, isLoading: false, isError: false, error: null as unknown },
  lyricsFor: vi.fn(),
  setFavorite: vi.fn(),
  favoriteVariables: undefined as { trackId: string; favorite: boolean } | undefined,
  favoritePending: false,
  setScrobbleEnabled: vi.fn(),
  scrobblePending: false,
  scrobbleVariables: undefined as { service: string; enabled: boolean } | undefined,
  upgradeTracks: vi.fn(),
  upgradePending: false,
  setLoudness: vi.fn(),
}));

vi.mock("@hooks/api/mutations/auth/useSetLoudness", () => ({
  useSetLoudness: () => ({ mutate: api.setLoudness }),
}));

vi.mock("@hooks/api", () => ({
  useFavoriteTracks: () => ({ data: api.favorites }),
  useListeningConnections: () => ({ data: api.connections }),
  useSetFavoriteTrack: () => ({
    mutate: api.setFavorite,
    isPending: api.favoritePending,
    variables: api.favoriteVariables,
  }),
  useSetScrobbleEnabled: () => ({
    mutate: api.setScrobbleEnabled,
    isPending: api.scrobblePending,
    variables: api.scrobbleVariables,
  }),
  useTrackLyrics: (trackId: string | null) => {
    api.lyricsFor(trackId);
    return api.lyrics;
  },
  useUpgradeTracks: () => ({ mutate: api.upgradeTracks, isPending: api.upgradePending }),
}));

const devices = vi.hoisted(() => ({
  known: [] as KnownDevice[],
  handOverTo: vi.fn(),
  toggleRemote: vi.fn(),
  commandActive: vi.fn(),
}));

vi.mock("../useDevices", () => ({
  usePlayerDevices: () => ({
    devices: devices.known,
    handOverTo: devices.handOverTo,
    toggleRemote: devices.toggleRemote,
    commandActive: devices.commandActive,
  }),
}));

vi.mock("../usePlayReporter", () => ({ usePlayReporter: () => undefined }));

const titles = vi.hoisted(() => ({ seen: [] as (string | null)[] }));

vi.mock("../useDocumentTitle", () => ({
  usePlayerDocumentTitle: (title: string | null) => {
    titles.seen.push(title);
  },
}));

const store = vi.hoisted(() => ({
  listeners: new Set<() => void>(),
  snapshot: sessionState(),
  actions: {
    togglePlay: vi.fn(),
    next: vi.fn(),
    previous: vi.fn(),
    seekTo: vi.fn(),
    playHere: vi.fn(),
    scrubTo: vi.fn(),
    setVolume: vi.fn(),
    toggleMute: vi.fn(),
    toggleShuffle: vi.fn(),
    cycleRepeat: vi.fn(),
    toggleChain: vi.fn(),
    toggleLyrics: vi.fn(),
    openLyrics: vi.fn(),
    toggleDevices: vi.fn(),
    toggleSettings: vi.fn(),
    setEqualizerEnabled: vi.fn(),
    setEqualizerBand: vi.fn(),
    setEqualizerPreamp: vi.fn(),
    applyEqualizerPreset: vi.fn(),
    saveEqualizerPreset: vi.fn(),
    deleteEqualizerPreset: vi.fn(),
    setCompressorEnabled: vi.fn(),
    applyCompressorPreset: vi.fn(),
    setCompressorParam: vi.fn(),
    setConversion: vi.fn(),
    toggleModes: vi.fn(),
    toggleQueue: vi.fn(),
    selectMode: vi.fn(),
    jumpTo: vi.fn(),
    removeFromQueue: vi.fn(),
    reorderQueue: vi.fn(),
    toggleFullscreen: vi.fn(),
    expectRemote: vi.fn(),
    restoreVolume: vi.fn(),
    restoreMode: vi.fn(),
    restorePlaybackSettings: vi.fn(),
  },
  setMessages: vi.fn(),
  setLoudnessPreferences: vi.fn(),
  currentTrack: vi.fn(),
}));

const auth = vi.hoisted(() => ({
  currentUser: { loudnessNormalization: true, loudnessPreampDb: 0 } as Record<string, unknown> | null,
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({
    currentUser: auth.currentUser,
    isLoading: false,
    isError: false,
    isAdmin: true,
    refetch: vi.fn(),
  }),
}));

vi.mock("../store", () => ({
  actions: store.actions,
  currentTrack: store.currentTrack,
  getSnapshot: () => store.snapshot,
  setMessages: store.setMessages,
  setLoudnessPreferences: store.setLoudnessPreferences,
  subscribe: (listener: () => void) => {
    store.listeners.add(listener);
    return () => {
      store.listeners.delete(listener);
    };
  },
}));

vi.mock("@modules/errors", () => ({
  resolveFriendlyError: (error: unknown) => ({ title: `friendly: ${String(error)}` }),
}));

import { usePlayer, usePlayerDock } from "../usePlayer";

function track(overrides: Partial<PlayerTrack> = {}): PlayerTrack {
  return {
    id: "t1",
    title: "Digital Love",
    artist: "Daft Punk",
    album: "Discovery",
    durationSeconds: 300,
    format: "flac",
    bitrateKbps: 1000,
    lossless: true,
    tone: "primary",
    artworkUrl: null,
    albumId: "album-1",
    replayGain: { trackGain: null, albumGain: null, trackPeak: null, albumPeak: null },
    ...overrides,
  };
}

function sessionState(overrides: Partial<PlayerSessionState> = {}): PlayerSessionState {
  return {
    queue: [track()],
    index: 0,
    playing: false,
    loading: false,
    positionSeconds: 0,
    durationSeconds: 300,
    scrubSeconds: null,
    volume: 0.8,
    muted: false,
    shuffle: false,
    shuffleOrder: [],
    repeat: "off",
    transcoding: false,
    armed: true,
    remote: null,
    offsetSeconds: 0,
    chainVisible: false,
    devicesOpen: false,
    settingsOpen: false,
    equalizer: { enabled: false, gainsDb: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], preampDb: 0 },
    equalizerPresets: [],
    compressor: { enabled: false, thresholdDb: -24, ratio: 4, attackMs: 20, releaseMs: 300, kneeDb: 3 },
    conversion: { enabled: false, bitrateKbps: 192 },
    modesOpen: false,
    queueOpen: false,
    mode: "normal",
    lyricsOpen: false,
    fullscreen: false,
    consecutiveFailures: 0,
    started: true,
    ...overrides,
  };
}

function remote(overrides: Partial<RemotePlayback> = {}): RemotePlayback {
  return {
    deviceId: "kitchen",
    deviceName: "Kitchen",
    confirmed: true,
    playing: true,
    track: track({ id: "t9", title: "Aerodynamic", durationSeconds: 212 }),
    positionSeconds: 30,
    shuffle: true,
    repeat: "all",
    volume: 0.3,
    muted: true,
    transcoding: true,
    updatedAt: Date.now(),
    ...overrides,
  };
}

function knownDevice(id: string, overrides: Partial<KnownDevice> = {}): KnownDevice {
  return { id, name: `Device ${id}`, kind: "phone", armed: true, playing: false, trackTitle: null, ...overrides };
}

function connection(overrides: Partial<ListeningConnectionStatus> = {}): ListeningConnectionStatus {
  return {
    service: "lastfm",
    connected: true,
    configured: true,
    externalUsername: "someone",
    scrobbleEnabled: true,
    relayedClients: [],
    lastFailure: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  store.listeners.clear();
  store.snapshot = sessionState();
  auth.currentUser = { loudnessNormalization: true, loudnessPreampDb: 0 };
  titles.seen = [];
  devices.known = [];
  api.favorites = [];
  api.connections = [];
  api.lyrics = { data: undefined, isLoading: false, isError: false, error: null };
  api.favoritePending = false;
  api.favoriteVariables = undefined;
  api.scrobblePending = false;
  api.scrobbleVariables = undefined;
  api.upgradePending = false;
});

describe("usePlayerDock", () => {
  it("stays hidden until something has been queued", () => {
    store.snapshot = sessionState({ started: false });

    const { result } = renderHook(() => usePlayerDock());

    expect(result.current).toBe("hidden");
  });

  it("shows the bar once the player has started", () => {
    const { result } = renderHook(() => usePlayerDock());

    expect(result.current).toBe("bar");
  });

  it("grows into the signal chain when it is opened", () => {
    store.snapshot = sessionState({ chainVisible: true });

    const { result } = renderHook(() => usePlayerDock());

    expect(result.current).toBe("chain");
  });

  it("follows the store as it changes", () => {
    const { result } = renderHook(() => usePlayerDock());

    act(() => {
      store.snapshot = sessionState({ chainVisible: true });
      store.listeners.forEach((listener) => listener());
    });

    expect(result.current).toBe("chain");
  });
});

describe("usePlayer view", () => {
  it("offers no view before anything is queued", () => {
    store.snapshot = sessionState({ queue: [], started: false });

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view).toBeNull();
  });

  it("offers no view for a queue that has not started", () => {
    store.snapshot = sessionState({ started: false });

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view).toBeNull();
  });

  it("describes the track that is playing here", () => {
    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.track.title).toBe("Digital Love");
    expect(result.current.view?.volume).toBe(0.8);
    expect(result.current.view?.activeDevice.local).toBe(true);
  });

  it("prefers the length the browser measured over the one the library recorded", () => {
    store.snapshot = sessionState({ durationSeconds: 297 });

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.track.durationSeconds).toBe(297);
  });

  it("keeps the recorded length while the browser has not measured one", () => {
    store.snapshot = sessionState({ durationSeconds: 0 });

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.track.durationSeconds).toBe(300);
  });

  it("labels the file it is actually streaming", () => {
    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.chain.fileLabel).toContain("FLAC");
    expect(result.current.view?.chain.transcoding).toBe(false);
  });

  it("says the server is converting when the browser cannot take the file", () => {
    store.snapshot = sessionState({ transcoding: true });

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.chain.transcoding).toBe(true);
    expect(result.current.view?.chain.serverLabel).toBe(enPlayer.chain.serverTranscoding.replace("{{bitrate}}", "320"));
  });

  it("lists what is still to come in the queue", () => {
    store.snapshot = sessionState({ queue: [track(), track({ id: "t2", title: "Aerodynamic" })] });

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.queue.playing?.track.id).toBe("t1");
    expect(result.current.view?.queue.upNext.map((entry) => entry.track.id)).toEqual(["t2"]);
  });

  it("lets the listener edit the queue while the sound is here", () => {
    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.queueEditable).toBe(true);
  });

  it("puts what is playing in the tab title only while it is sounding", () => {
    store.snapshot = sessionState({ playing: true });

    renderHook(() => usePlayer());

    expect(titles.seen.at(-1)).toContain("Digital Love");
  });

  it("leaves the tab title alone while the player is paused", () => {
    renderHook(() => usePlayer());

    expect(titles.seen.at(-1)).toBeNull();
  });

  it("hands the store the translated notices it announces with", () => {
    renderHook(() => usePlayer());

    expect(store.setMessages).toHaveBeenCalledWith(
      expect.objectContaining({ queueEnd: enPlayer.notice.queueEnd, deviceGone: enPlayer.notice.deviceGone })
    );
  });

  it("puts back the remembered volume and mode on the first render", () => {
    renderHook(() => usePlayer());

    expect(store.actions.restoreVolume).toHaveBeenCalled();
    expect(store.actions.restoreMode).toHaveBeenCalled();
  });

  it("hands the store the listener's own normalization settings", () => {
    auth.currentUser = { loudnessNormalization: false, loudnessPreampDb: 4 };

    renderHook(() => usePlayer());

    expect(store.setLoudnessPreferences).toHaveBeenCalledWith({ enabled: false, preAmpDb: 4 });
  });

  it("leaves the normalization alone until it knows who is listening", () => {
    auth.currentUser = null;

    renderHook(() => usePlayer());

    expect(store.setLoudnessPreferences).not.toHaveBeenCalled();
  });
});

describe("usePlayer mirroring another device", () => {
  it("describes the track the other device is playing, not this queue", () => {
    store.snapshot = sessionState({ remote: remote() });

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.track.title).toBe("Aerodynamic");
    expect(result.current.view?.playing).toBe(true);
    expect(result.current.view?.shuffle).toBe(true);
    expect(result.current.view?.repeat).toBe("all");
    expect(result.current.view?.volume).toBe(0.3);
    expect(result.current.view?.muted).toBe(true);
    expect(result.current.view?.loading).toBe(false);
  });

  it("refuses queue edits that the other device would never see", () => {
    store.snapshot = sessionState({ remote: remote() });

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.queueEditable).toBe(false);
  });

  it("shows the other device as the one holding the sound", () => {
    store.snapshot = sessionState({ remote: remote() });

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.activeDevice.id).toBe("kitchen");
    expect(result.current.view?.activeDevice.local).toBe(false);
  });

  it("lists a device it is mirroring even before the heartbeat has named it", () => {
    store.snapshot = sessionState({ remote: remote() });

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.devices.map((entry) => entry.id)).toEqual(["here", "kitchen"]);
  });

  it("does not list the mirrored device twice once the heartbeat names it", () => {
    devices.known = [knownDevice("kitchen")];
    store.snapshot = sessionState({ remote: remote() });

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.devices.map((entry) => entry.id)).toEqual(["here", "kitchen"]);
    expect(result.current.view?.devices[1]?.kind).toBe("phone");
  });

  it("shows a device as quiet while a different one holds the sound", () => {
    devices.known = [knownDevice("study", { playing: true })];
    store.snapshot = sessionState({ remote: remote() });

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.devices.find((entry) => entry.id === "study")?.playing).toBe(false);
  });

  it("keeps a device's own report when nothing else holds the sound", () => {
    devices.known = [knownDevice("study", { playing: true })];

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.devices.find((entry) => entry.id === "study")?.playing).toBe(true);
  });

  it("projects the position on from when the other device last reported it", () => {
    store.snapshot = sessionState({ remote: remote({ positionSeconds: 30, updatedAt: Date.now() - 5_000 }) });

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.positionSeconds).toBeGreaterThanOrEqual(34);
  });
});

describe("usePlayer actions", () => {
  it("drives this player directly while the sound is here", () => {
    const { result } = renderHook(() => usePlayer());

    result.current.actions.togglePlay();
    result.current.actions.next();
    result.current.actions.previous();
    result.current.actions.seekTo(10);
    result.current.actions.setVolume(0.5);
    result.current.actions.toggleMute();
    result.current.actions.toggleShuffle();
    result.current.actions.cycleRepeat();

    expect(store.actions.togglePlay).toHaveBeenCalled();
    expect(store.actions.next).toHaveBeenCalled();
    expect(store.actions.previous).toHaveBeenCalled();
    expect(store.actions.seekTo).toHaveBeenCalledWith(10);
    expect(store.actions.setVolume).toHaveBeenCalledWith(0.5);
    expect(store.actions.toggleMute).toHaveBeenCalled();
    expect(store.actions.toggleShuffle).toHaveBeenCalled();
    expect(store.actions.cycleRepeat).toHaveBeenCalled();
    expect(devices.commandActive).not.toHaveBeenCalled();
  });

  it("commands the other device instead, and shows the change before it confirms", () => {
    store.snapshot = sessionState({ remote: remote() });
    const { result } = renderHook(() => usePlayer());

    result.current.actions.togglePlay();

    expect(devices.commandActive).toHaveBeenCalledWith("pause");
    expect(store.actions.expectRemote).toHaveBeenCalledWith({ playing: false });
    expect(store.actions.togglePlay).not.toHaveBeenCalled();
  });

  it("asks a paused remote device to play", () => {
    store.snapshot = sessionState({ remote: remote({ playing: false }) });
    const { result } = renderHook(() => usePlayer());

    result.current.actions.togglePlay();

    expect(devices.commandActive).toHaveBeenCalledWith("play");
    expect(store.actions.expectRemote).toHaveBeenCalledWith({ playing: true });
  });

  it("passes a skip and a seek on to the other device", () => {
    store.snapshot = sessionState({ remote: remote() });
    const { result } = renderHook(() => usePlayer());

    result.current.actions.next();
    result.current.actions.previous();
    result.current.actions.seekTo(75);

    expect(devices.commandActive).toHaveBeenCalledWith("next");
    expect(devices.commandActive).toHaveBeenCalledWith("previous");
    expect(devices.commandActive).toHaveBeenCalledWith("seek", 75);
    expect(store.actions.expectRemote).toHaveBeenCalledWith({ positionSeconds: 75 });
  });

  it("passes the volume and the mute on to the other device", () => {
    store.snapshot = sessionState({ remote: remote({ muted: false }) });
    const { result } = renderHook(() => usePlayer());

    result.current.actions.setVolume(0.6);
    result.current.actions.toggleMute();

    expect(devices.commandActive).toHaveBeenCalledWith("setVolume", 0.6);
    expect(store.actions.expectRemote).toHaveBeenCalledWith({ volume: 0.6, muted: false });
    expect(devices.commandActive).toHaveBeenCalledWith("toggleMute");
    expect(store.actions.expectRemote).toHaveBeenCalledWith({ muted: true });
  });

  it("passes shuffle and repeat on, carrying the other device's current setting forward", () => {
    store.snapshot = sessionState({ remote: remote({ shuffle: false, repeat: "off" }) });
    const { result } = renderHook(() => usePlayer());

    result.current.actions.toggleShuffle();
    result.current.actions.cycleRepeat();

    expect(store.actions.expectRemote).toHaveBeenCalledWith({ shuffle: true });
    expect(store.actions.expectRemote).toHaveBeenCalledWith({ repeat: "all" });
  });

  it("asks for a better copy of the track that is playing", () => {
    const { result } = renderHook(() => usePlayer());

    result.current.actions.searchBetterQuality();

    expect(api.upgradeTracks).toHaveBeenCalledWith({ trackIds: ["t1"] });
  });

  it("asks for nothing when there is no track to improve", () => {
    store.snapshot = sessionState({ queue: [], started: false });
    const { result } = renderHook(() => usePlayer());

    result.current.actions.searchBetterQuality();

    expect(api.upgradeTracks).not.toHaveBeenCalled();
  });

  it("reports an upgrade that is under way", () => {
    api.upgradePending = true;

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.upgrading).toBe(true);
  });
});

describe("usePlayer favourites", () => {
  it("marks a track the library already holds as a favourite", () => {
    api.favorites = ["t1"];

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.favorite).toBe(true);
  });

  it("flips the favourite the other way", () => {
    const { result } = renderHook(() => usePlayer());

    result.current.actions.toggleFavorite();

    expect(api.setFavorite).toHaveBeenCalledWith({ trackId: "t1", favorite: true });
  });

  it("shows the new state while the write is still in flight", () => {
    api.favoritePending = true;
    api.favoriteVariables = { trackId: "t1", favorite: true };

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.favorite).toBe(true);
  });

  it("does not show another track's pending favourite", () => {
    api.favoritePending = true;
    api.favoriteVariables = { trackId: "other", favorite: true };

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.favorite).toBe(false);
  });

  it("does nothing when there is no track to favourite", () => {
    store.snapshot = sessionState({ queue: [], started: false });
    const { result } = renderHook(() => usePlayer());

    result.current.actions.toggleFavorite();

    expect(api.setFavorite).not.toHaveBeenCalled();
  });
});

describe("usePlayer scrobbling", () => {
  it("reports scrobbling off when no service is connected", () => {
    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.scrobble).toBe("off");
    expect(result.current.view?.scrobbleActionable).toBe(false);
  });

  it("reports scrobbling on for a connected service", () => {
    api.connections = [connection()];

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.scrobble).toBe("sending");
    expect(result.current.view?.scrobbleActionable).toBe(true);
  });

  it("turns scrobbling off on every connected service at once", () => {
    api.connections = [connection(), connection({ service: "listenbrainz" })];
    const { result } = renderHook(() => usePlayer());

    result.current.actions.toggleScrobbling();

    expect(api.setScrobbleEnabled).toHaveBeenCalledTimes(2);
    expect(api.setScrobbleEnabled).toHaveBeenCalledWith({ service: "lastfm", enabled: false });
  });

  it("turns scrobbling on when no connected service has it on", () => {
    api.connections = [connection({ scrobbleEnabled: false })];
    const { result } = renderHook(() => usePlayer());

    result.current.actions.toggleScrobbling();

    expect(api.setScrobbleEnabled).toHaveBeenCalledWith({ service: "lastfm", enabled: true });
  });

  it("shows the state the listener just asked for while the write is in flight", () => {
    api.connections = [connection({ scrobbleEnabled: false })];
    api.scrobblePending = true;
    api.scrobbleVariables = { service: "lastfm", enabled: true };

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.scrobble).toBe("sending");
  });

  it("shows scrobbling off while a request to turn it off is in flight", () => {
    api.connections = [connection()];
    api.scrobblePending = true;
    api.scrobbleVariables = { service: "lastfm", enabled: false };

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.scrobble).toBe("off");
  });
});

describe("usePlayer lyrics", () => {
  it("does not fetch lyrics for a pane nobody opened", () => {
    renderHook(() => usePlayer());

    expect(api.lyricsFor).toHaveBeenCalledWith(null);
  });

  it("fetches the lyrics of the track that is playing once the pane is open", () => {
    store.snapshot = sessionState({ lyricsOpen: true });

    renderHook(() => usePlayer());

    expect(api.lyricsFor).toHaveBeenCalledWith("t1");
  });

  it("passes the lyrics through to the view", () => {
    store.snapshot = sessionState({ lyricsOpen: true });
    api.lyrics = { data: { synced: true, lines: [] }, isLoading: false, isError: false, error: null };

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.lyrics).toEqual({ synced: true, lines: [] });
    expect(result.current.view?.lyricsFailure).toBeNull();
  });

  it("reports a failure the listener can read rather than a raw error", () => {
    store.snapshot = sessionState({ lyricsOpen: true });
    api.lyrics = { data: undefined, isLoading: false, isError: true, error: "boom" };

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.lyricsFailure).toBe("friendly: boom");
  });

  it("reports the fetch while it is still under way", () => {
    store.snapshot = sessionState({ lyricsOpen: true });
    api.lyrics = { data: undefined, isLoading: true, isError: false, error: null };

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.lyricsLoading).toBe(true);
  });
});

describe("usePlayer equaliser", () => {
  const ROCK = [5, 4, 3, 1, -1, 1, 3, 4, 5, 5];

  it("restores the saved playback settings on mount, next to the volume and the mode", () => {
    renderHook(() => usePlayer());

    expect(store.actions.restorePlaybackSettings).toHaveBeenCalled();
  });

  it("names the preset the curve matches and the headroom it costs", () => {
    store.snapshot = sessionState({ equalizer: { enabled: true, gainsDb: ROCK, preampDb: 0 } });

    const { result } = renderHook(() => usePlayer());

    const headroomDb = result.current.view?.equalizer.headroomDb ?? 0;
    expect(headroomDb).toBeCloseTo(-6.05, 1);
    expect(result.current.view?.equalizer).toEqual({
      enabled: true,
      gainsDb: ROCK,
      preampDb: 0,
      preset: { kind: "builtIn", id: "rock" },
      headroomDb,
      customPresets: [],
    });
    expect(result.current.view?.chain.equalizerLabel).toBe(
      `${enPlayer.equalizer.presets.rock} · ${headroomDb.toFixed(1)} dB`
    );
    expect(result.current.view?.chain.equalizerActive).toBe(true);
  });

  it("names a curve the listener saved by the name they gave it", () => {
    const curve = [2, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    store.snapshot = sessionState({
      equalizer: { enabled: true, gainsDb: curve, preampDb: 0 },
      equalizerPresets: [{ name: "Mine", gainsDb: curve }],
    });

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.equalizer.preset).toEqual({ kind: "custom", name: "Mine" });
    expect(result.current.view?.equalizer.customPresets).toEqual(["Mine"]);
    expect(result.current.view?.chain.equalizerLabel).toContain("Mine ·");
  });

  it("prefers the name the listener gave a curve over the built-in preset it happens to equal", () => {
    store.snapshot = sessionState({
      equalizer: { enabled: true, gainsDb: ROCK, preampDb: 0 },
      equalizerPresets: [{ name: "My rock", gainsDb: ROCK }],
    });

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.equalizer.preset).toEqual({ kind: "custom", name: "My rock" });
  });

  it("calls a curve that matches no preset custom, and charges nothing for a curve that only cuts", () => {
    store.snapshot = sessionState({
      equalizer: { enabled: true, gainsDb: [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0], preampDb: 0 },
    });

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.equalizer.preset).toBeNull();
    expect(result.current.view?.equalizer.headroomDb).toBe(0);
    expect(result.current.view?.chain.equalizerLabel).toBe(enPlayer.equalizer.custom);
  });

  it("reports the equaliser off in the chain, with no headroom for a curve nobody hears", () => {
    store.snapshot = sessionState({ equalizer: { enabled: false, gainsDb: ROCK, preampDb: 0 } });

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.chain.equalizerLabel).toBe(enPlayer.chain.equalizerOff);
    expect(result.current.view?.chain.equalizerActive).toBe(false);
    expect(result.current.view?.equalizer.headroomDb).toBe(0);
  });

  it("names the compressor preset in play and passes the settings through", () => {
    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.compressor).toEqual({
      enabled: false,
      preset: "moderate",
      thresholdDb: -24,
      ratio: 4,
      attackMs: 20,
      releaseMs: 300,
      kneeDb: 3,
    });
  });

  it("reads the loudness preference from the account rather than the browser", () => {
    auth.currentUser = { loudnessNormalization: false, loudnessPreampDb: 3 };

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.loudness).toEqual({ enabled: false, preAmpDb: 3 });
  });

  it("hands the settings actions straight to the store, even while another device has the sound", () => {
    store.snapshot = sessionState({ remote: remote() });

    const { result } = renderHook(() => usePlayer());
    result.current.actions.toggleSettings();
    result.current.actions.setEqualizerEnabled(true);
    result.current.actions.setEqualizerBand(2, 3);
    result.current.actions.setEqualizerPreamp(1.5);
    result.current.actions.applyEqualizerPreset({ kind: "builtIn", id: "rock" });
    result.current.actions.saveEqualizerPreset("Mine");
    result.current.actions.deleteEqualizerPreset("Mine");
    result.current.actions.setCompressorEnabled(true);
    result.current.actions.applyCompressorPreset("limiter");
    result.current.actions.setCompressorParam("ratio", 8);
    result.current.actions.setConversion({ enabled: true, bitrateKbps: 128 });

    expect(store.actions.toggleSettings).toHaveBeenCalled();
    expect(store.actions.setEqualizerEnabled).toHaveBeenCalledWith(true);
    expect(store.actions.setEqualizerBand).toHaveBeenCalledWith(2, 3);
    expect(store.actions.setEqualizerPreamp).toHaveBeenCalledWith(1.5);
    expect(store.actions.applyEqualizerPreset).toHaveBeenCalledWith({ kind: "builtIn", id: "rock" });
    expect(store.actions.saveEqualizerPreset).toHaveBeenCalledWith("Mine");
    expect(store.actions.deleteEqualizerPreset).toHaveBeenCalledWith("Mine");
    expect(store.actions.setCompressorEnabled).toHaveBeenCalledWith(true);
    expect(store.actions.applyCompressorPreset).toHaveBeenCalledWith("limiter");
    expect(store.actions.setCompressorParam).toHaveBeenCalledWith("ratio", 8);
    expect(store.actions.setConversion).toHaveBeenCalledWith({ enabled: true, bitrateKbps: 128 });
  });

  it("writes the loudness preference to the account, which is where it lives", () => {
    const { result } = renderHook(() => usePlayer());
    result.current.actions.setLoudnessEnabled(false);
    result.current.actions.setLoudnessPreamp(-2);

    expect(api.setLoudness).toHaveBeenCalledWith({ loudnessNormalization: false });
    expect(api.setLoudness).toHaveBeenCalledWith({ loudnessPreampDb: -2 });
  });
});

describe("usePlayer conversion", () => {
  it("names the bitrate the listener asked for when their conversion is on", () => {
    store.snapshot = sessionState({ transcoding: true, conversion: { enabled: true, bitrateKbps: 128 } });

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.chain.serverLabel).toBe(enPlayer.chain.serverTranscoding.replace("{{bitrate}}", "128"));
    expect(result.current.view?.conversion).toEqual({ enabled: true, bitrateKbps: 128 });
  });

  it("says only that another device is converting, since its bitrate is its own business", () => {
    store.snapshot = sessionState({ remote: remote({ transcoding: true }) });

    const { result } = renderHook(() => usePlayer());

    expect(result.current.view?.chain.serverLabel).toBe(enPlayer.chain.serverConverting);
  });
});
