import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PlayerTrack } from "@components/Player";

import { MAX_CONSECUTIVE_FAILURES, MODE_STORAGE_KEY, SKIP_DELAY_MS, VOLUME_STORAGE_KEY } from "../constants";
import type { EngineCallbacks } from "../types";

const miniWindow = vi.hoisted(() => ({
  close: vi.fn(),
  open: vi.fn(async (_onClosed: () => void) => true),
}));

vi.mock("@components/Player", async () => {
  const helpers = await vi.importActual<typeof import("@components/Player/helpers")>("@components/Player/helpers");
  return {
    nextRepeat: helpers.nextRepeat,
    restorablePlayerMode: helpers.restorablePlayerMode,
    shouldRestart: helpers.shouldRestart,
    closeMiniWindow: miniWindow.close,
    openMiniWindow: miniWindow.open,
  };
});

vi.mock("@utils/artworkProxy", () => ({ artworkProxySrc: (value: string) => `proxy:${value}` }));

const notices = vi.hoisted(() => ({ announce: vi.fn() }));

vi.mock("../announce", () => ({ announce: notices.announce }));

const engine = vi.hoisted(() => ({
  handlers: null as EngineCallbacks | null,
  playable: true,
  applyVolume: vi.fn(),
  loadAndPlay: vi.fn(),
  loadAt: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  seek: vi.fn(),
  stop: vi.fn(),
}));

vi.mock("../engine", () => ({
  applyVolume: engine.applyVolume,
  canPlayMime: () => engine.playable,
  connectEngine: (handlers: EngineCallbacks) => {
    engine.handlers = handlers;
  },
  loadAndPlay: engine.loadAndPlay,
  loadAt: engine.loadAt,
  pause: engine.pause,
  resume: engine.resume,
  seek: engine.seek,
  stop: engine.stop,
}));

const media = vi.hoisted(() => ({
  clearMediaSession: vi.fn(),
  publishMediaSession: vi.fn<(track: PlayerTrack, handlers: MediaHandlers) => void>(),
  publishPlaybackState: vi.fn(),
  publishPosition: vi.fn(),
}));

vi.mock("../media-session", () => media);

function track(id: string, overrides: Partial<PlayerTrack> = {}): PlayerTrack {
  return {
    id,
    title: `Title ${id}`,
    artist: "Daft Punk",
    album: "Homework",
    durationSeconds: 200,
    format: "mp3",
    bitrateKbps: 320,
    lossless: false,
    tone: "primary",
    artworkUrl: null,
    albumId: "album-1",
    replayGain: { trackGain: null, albumGain: null, trackPeak: null, albumPeak: null },
    ...overrides,
  };
}

interface MediaHandlers {
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (seconds: number) => void;
}

function lastMediaHandlers(): MediaHandlers {
  const call = media.publishMediaSession.mock.calls.at(-1);
  if (call === undefined) throw new Error("the player never published a media session");
  return call[1];
}

async function freshStore(): Promise<typeof import("../store")> {
  vi.resetModules();
  const store = await import("../store");
  store.setMessages({
    skipping: (title) => `skipping ${title}`,
    resumedFrom: (client) => `resumed from ${client}`,
    handOverFailed: (device) => `hand over to ${device} failed`,
    deviceGone: "device gone",
    queueEnd: "queue end",
    autoplayBlocked: "autoplay blocked",
    tooManyFailures: "too many failures",
  });
  return store;
}

beforeEach(() => {
  vi.clearAllMocks();
  engine.handlers = null;
  engine.playable = true;
  miniWindow.open.mockImplementation(async () => true);
  window.localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("player store playback", () => {
  it("streams the file untouched when the browser can decode the format", async () => {
    const store = await freshStore();

    store.actions.playQueue([track("a")], 0);

    expect(engine.loadAndPlay).toHaveBeenCalledWith("/api/v1/library/tracks/a/stream", 0.8, false, 0);
    expect(store.getSnapshot().transcoding).toBe(false);
  });

  it("asks the server to convert a format the browser cannot decode", async () => {
    engine.playable = false;
    const store = await freshStore();

    store.actions.playQueue([track("a", { format: "flac" })], 0);

    expect(engine.loadAndPlay).toHaveBeenCalledWith(
      "/api/v1/library/tracks/a/stream?format=mp3&maxBitrate=320",
      0.8,
      false,
      0
    );
    expect(store.getSnapshot().transcoding).toBe(true);
  });

  it("pauses any other audio on the page so two sources never overlap", async () => {
    const store = await freshStore();
    const other = document.createElement("audio");
    const pause = vi.fn();
    Object.defineProperty(other, "paused", { value: false });
    other.pause = pause;
    document.body.appendChild(other);

    store.actions.playQueue([track("a")], 0);

    expect(pause).toHaveBeenCalled();
    other.remove();
  });

  it("ignores a jump to an index the queue does not hold", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);
    engine.loadAndPlay.mockClear();

    store.actions.jumpTo(9);

    expect(engine.loadAndPlay).not.toHaveBeenCalled();
  });

  it("tells every subscriber that the snapshot moved", async () => {
    const store = await freshStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.actions.toggleChain();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.actions.toggleChain();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("reports no current track while the queue is empty", async () => {
    const store = await freshStore();

    expect(store.currentTrack()).toBeNull();
    expect(store.sessionSnapshot()).toEqual({ trackIds: [], currentTrackId: null, positionMs: 0 });
  });

  it("carries the position into the session snapshot in milliseconds", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 0);
    engine.handlers?.onProgress(12.4, 200);

    expect(store.sessionSnapshot()).toEqual({ trackIds: ["a", "b"], currentTrackId: "a", positionMs: 12400 });
  });
});

describe("player store engine callbacks", () => {
  it("publishes progress against the true duration while the stream is direct", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);

    engine.handlers?.onProgress(30, 195);

    expect(store.getSnapshot().positionSeconds).toBe(30);
    expect(store.getSnapshot().durationSeconds).toBe(195);
    expect(media.publishPosition).toHaveBeenCalledWith(195, 30, false);
  });

  it("adds the server-side offset back on, so a converted stream still reports the real position", async () => {
    engine.playable = false;
    const store = await freshStore();
    store.actions.playQueue([track("a", { format: "flac" })], 0);
    store.actions.seekTo(60);

    engine.handlers?.onProgress(5, 140);

    expect(store.getSnapshot().positionSeconds).toBe(65);
    expect(store.getSnapshot().durationSeconds).toBe(200);
  });

  it("arms the player the first time sound actually comes out", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);

    engine.handlers?.onPlayingChange(true);

    expect(store.getSnapshot().playing).toBe(true);
    expect(store.getSnapshot().armed).toBe(true);
    expect(media.publishPlaybackState).toHaveBeenCalledWith(true);
  });

  it("stays armed once it has sounded, even after a pause", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);
    engine.handlers?.onPlayingChange(true);

    engine.handlers?.onPlayingChange(false);

    expect(store.getSnapshot().playing).toBe(false);
    expect(store.getSnapshot().armed).toBe(true);
  });

  it("forgets earlier failures as soon as a track plays", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 0);
    engine.handlers?.onFailure("load");
    expect(store.getSnapshot().consecutiveFailures).toBe(1);

    engine.handlers?.onPlayingChange(true);

    expect(store.getSnapshot().consecutiveFailures).toBe(0);
  });

  it("mirrors the loading flag the engine reports", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);

    engine.handlers?.onLoadingChange(false);

    expect(store.getSnapshot().loading).toBe(false);
  });
});

describe("player store advance", () => {
  it("moves to the next track when one ends", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 0);

    engine.handlers?.onEnded();

    expect(store.getSnapshot().index).toBe(1);
  });

  it("restarts the same track when repeat-one is set", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 0);
    store.actions.cycleRepeat();
    store.actions.cycleRepeat();
    expect(store.getSnapshot().repeat).toBe("one");

    engine.handlers?.onEnded();

    expect(engine.seek).toHaveBeenCalledWith(0);
    expect(engine.resume).toHaveBeenCalled();
    expect(store.getSnapshot().index).toBe(0);
  });

  it("reloads a converted stream to repeat it, because seeking a transcode does not rewind it", async () => {
    engine.playable = false;
    const store = await freshStore();
    store.actions.playQueue([track("a", { format: "flac" })], 0);
    store.actions.cycleRepeat();
    store.actions.cycleRepeat();
    engine.loadAndPlay.mockClear();

    engine.handlers?.onEnded();

    expect(engine.loadAndPlay).toHaveBeenCalled();
    expect(engine.seek).not.toHaveBeenCalled();
  });

  it("wraps back to the top when repeat-all is set", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 1);
    store.actions.cycleRepeat();
    expect(store.getSnapshot().repeat).toBe("all");

    engine.handlers?.onEnded();

    expect(store.getSnapshot().index).toBe(0);
  });

  it("wraps to the head of the shuffled order rather than the first track", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b"), track("c")], 2);
    store.actions.toggleShuffle();
    store.actions.cycleRepeat();
    const order = [...store.getSnapshot().shuffleOrder];
    expect(order[0]).toBe(2);
    store.actions.next();
    store.actions.next();

    engine.handlers?.onEnded();

    expect(store.getSnapshot().index).toBe(order[0]);
  });

  it("rests at the end of the queue and says so, keeping the last track loaded so play can start it again", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);

    engine.handlers?.onEnded();

    expect(engine.stop).not.toHaveBeenCalled();
    expect(engine.pause).toHaveBeenCalled();
    expect(store.getSnapshot().playing).toBe(false);
    expect(store.getSnapshot().positionSeconds).toBe(store.getSnapshot().durationSeconds);
    expect(media.publishPlaybackState).toHaveBeenLastCalledWith(false);
    expect(notices.announce).toHaveBeenCalledWith({ text: "queue end", tone: "info" });

    store.actions.togglePlay();

    expect(engine.resume).toHaveBeenCalled();
    expect(engine.loadAndPlay).toHaveBeenCalledTimes(1);
  });

  it("pressing next past the end says so again without unloading the track", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);
    engine.handlers?.onEnded();

    store.actions.next();

    expect(engine.stop).not.toHaveBeenCalled();
    expect(notices.announce).toHaveBeenCalledTimes(2);
  });

  it("skips forward on the user's press without honouring repeat-one", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 0);
    store.actions.cycleRepeat();
    store.actions.cycleRepeat();

    store.actions.next();

    expect(store.getSnapshot().index).toBe(1);
  });
});

describe("player store failures", () => {
  it("asks the listener to press play when the browser blocked autoplay", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);

    engine.handlers?.onFailure("autoplay");

    expect(store.getSnapshot().playing).toBe(false);
    expect(store.getSnapshot().loading).toBe(false);
    expect(store.getSnapshot().consecutiveFailures).toBe(0);
    expect(notices.announce).toHaveBeenCalledWith({ text: "autoplay blocked", tone: "warning" });
  });

  it("skips past a track it cannot load, after a pause the listener can read", async () => {
    vi.useFakeTimers();
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 0);

    engine.handlers?.onFailure("load");

    expect(notices.announce).toHaveBeenCalledWith({ text: "skipping Title a", tone: "danger" });
    expect(store.getSnapshot().index).toBe(0);

    vi.advanceTimersByTime(SKIP_DELAY_MS);

    expect(store.getSnapshot().index).toBe(1);
  });

  it("gives up rather than walking the whole queue when nothing will play", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b"), track("c")], 0);

    for (let attempt = 0; attempt < MAX_CONSECUTIVE_FAILURES; attempt += 1) engine.handlers?.onFailure("stall");

    expect(store.getSnapshot().started).toBe(false);
    expect(engine.stop).toHaveBeenCalled();
    expect(notices.announce).toHaveBeenLastCalledWith({ text: "too many failures", tone: "danger" });
  });
});

describe("player store transport", () => {
  it("does nothing on play when there is no track at all", async () => {
    const store = await freshStore();

    store.actions.togglePlay();

    expect(engine.resume).not.toHaveBeenCalled();
    expect(engine.loadAndPlay).not.toHaveBeenCalled();
  });

  it("loads the track again when play is pressed after the player gave up", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);
    for (let attempt = 0; attempt < MAX_CONSECUTIVE_FAILURES; attempt += 1) engine.handlers?.onFailure("load");
    expect(store.getSnapshot().started).toBe(false);
    engine.loadAndPlay.mockClear();

    store.actions.togglePlay();

    expect(engine.loadAndPlay).toHaveBeenCalled();
    expect(engine.resume).not.toHaveBeenCalled();
  });

  it("resumes rather than reloading a track that is merely armed", async () => {
    const store = await freshStore();
    store.actions.addToQueue([track("a")]);
    engine.loadAndPlay.mockClear();

    store.actions.togglePlay();

    expect(engine.resume).toHaveBeenCalled();
    expect(engine.loadAndPlay).not.toHaveBeenCalled();
  });

  it("pauses what is sounding and resumes it again", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);
    engine.handlers?.onPlayingChange(true);

    store.actions.togglePlay();
    expect(engine.pause).toHaveBeenCalled();

    engine.handlers?.onPlayingChange(false);
    store.actions.togglePlay();
    expect(engine.resume).toHaveBeenCalled();
  });

  it("rewinds instead of stepping back once the track is past its opening", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 1);
    engine.handlers?.onProgress(30, 200);

    store.actions.previous();

    expect(engine.seek).toHaveBeenCalledWith(0);
    expect(store.getSnapshot().index).toBe(1);
  });

  it("steps back to the previous track within the opening seconds", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 1);

    store.actions.previous();

    expect(store.getSnapshot().index).toBe(0);
  });

  it("rewinds when there is nothing before the current track", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);

    store.actions.previous();

    expect(engine.seek).toHaveBeenCalledWith(0);
  });

  it("reloads a converted stream from the new offset rather than seeking it", async () => {
    engine.playable = false;
    const store = await freshStore();
    store.actions.playQueue([track("a", { format: "flac" })], 0);
    engine.loadAndPlay.mockClear();

    store.actions.seekTo(90);

    expect(engine.seek).not.toHaveBeenCalled();
    expect(engine.loadAndPlay).toHaveBeenCalledWith(
      "/api/v1/library/tracks/a/stream?format=mp3&maxBitrate=320&offset=90",
      0.8,
      false,
      0
    );
  });

  it("clears the scrub handle once the seek lands", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);
    store.actions.scrubTo(42);
    expect(store.getSnapshot().scrubSeconds).toBe(42);

    store.actions.seekTo(42);

    expect(store.getSnapshot().scrubSeconds).toBeNull();
    expect(store.getSnapshot().positionSeconds).toBe(42);
  });
});

describe("player store queue editing", () => {
  it("refuses to drop the track that is playing", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 0);

    store.actions.removeFromQueue(0);

    expect(store.getSnapshot().queue).toHaveLength(2);
  });

  it("ignores a removal of an index that is not there", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 0);

    store.actions.removeFromQueue(7);

    expect(store.getSnapshot().queue).toHaveLength(2);
  });

  it("keeps pointing at the same track when an earlier one is dropped", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b"), track("c")], 2);

    store.actions.removeFromQueue(0);

    expect(store.getSnapshot().index).toBe(1);
    expect(store.getSnapshot().queue[store.getSnapshot().index]?.id).toBe("c");
  });

  it("drops the removed index out of the shuffled order too", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b"), track("c")], 0);
    store.actions.toggleShuffle();

    store.actions.removeFromQueue(2);

    expect(store.getSnapshot().shuffleOrder).not.toContain(2);
    expect(store.getSnapshot().shuffleOrder).toHaveLength(2);
  });

  it("rewrites only what comes after the playing track when it is reordered", async () => {
    const store = await freshStore();
    const [a, b, c] = [track("a"), track("b"), track("c")];
    store.actions.playQueue([a, b, c], 0);

    store.actions.reorderQueue([c, b]);

    expect(store.getSnapshot().queue.map((entry) => entry.id)).toEqual(["a", "c", "b"]);
  });

  it("ignores an empty reorder", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 0);

    store.actions.reorderQueue([]);

    expect(store.getSnapshot().queue.map((entry) => entry.id)).toEqual(["a", "b"]);
  });

  it("reorders the shuffled order rather than the queue while shuffle is on", async () => {
    const store = await freshStore();
    const [a, b, c] = [track("a"), track("b"), track("c")];
    store.actions.playQueue([a, b, c], 0);
    store.actions.toggleShuffle();

    store.actions.reorderQueue([c, b]);

    expect(store.getSnapshot().queue.map((entry) => entry.id)).toEqual(["a", "b", "c"]);
    expect(store.getSnapshot().shuffleOrder).toEqual([0, 2, 1]);
  });

  it("refuses a shuffled reorder naming a track the queue does not hold", async () => {
    const store = await freshStore();
    const [a, b] = [track("a"), track("b")];
    store.actions.playQueue([a, b], 0);
    store.actions.toggleShuffle();
    const before = [...store.getSnapshot().shuffleOrder];

    store.actions.reorderQueue([track("stranger")]);

    expect(store.getSnapshot().shuffleOrder).toEqual(before);
  });
});

describe("player store volume and panels", () => {
  it("clamps the volume to the range the slider can express and remembers it", async () => {
    const store = await freshStore();

    store.actions.setVolume(2);

    expect(store.getSnapshot().volume).toBe(1);
    expect(engine.applyVolume).toHaveBeenCalledWith(1, false);
    expect(window.localStorage.getItem(VOLUME_STORAGE_KEY)).toBe("1");
  });

  it("unmutes when the listener moves the slider", async () => {
    const store = await freshStore();
    store.actions.toggleMute();
    expect(store.getSnapshot().muted).toBe(true);

    store.actions.setVolume(0.4);

    expect(store.getSnapshot().muted).toBe(false);
  });

  it("restores a remembered volume on the next visit", async () => {
    window.localStorage.setItem(VOLUME_STORAGE_KEY, "0.35");
    const store = await freshStore();

    store.actions.restoreVolume();

    expect(store.getSnapshot().volume).toBe(0.35);
    expect(engine.applyVolume).toHaveBeenCalledWith(0.35, false);
  });

  it("ignores a stored volume outside the slider range", async () => {
    window.localStorage.setItem(VOLUME_STORAGE_KEY, "4");
    const store = await freshStore();

    store.actions.restoreVolume();

    expect(store.getSnapshot().volume).toBe(0.8);
  });

  it("ignores a stored volume that is not a number", async () => {
    window.localStorage.setItem(VOLUME_STORAGE_KEY, "loud");
    const store = await freshStore();

    store.actions.restoreVolume();

    expect(store.getSnapshot().volume).toBe(0.8);
  });

  it("cycles repeat through all and one and back to off", async () => {
    const store = await freshStore();

    store.actions.cycleRepeat();
    expect(store.getSnapshot().repeat).toBe("all");
    store.actions.cycleRepeat();
    expect(store.getSnapshot().repeat).toBe("one");
    store.actions.cycleRepeat();
    expect(store.getSnapshot().repeat).toBe("off");
  });

  it("drops the shuffled order when shuffle is turned back off", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 0);
    store.actions.toggleShuffle();
    expect(store.getSnapshot().shuffleOrder).toHaveLength(2);

    store.actions.toggleShuffle();

    expect(store.getSnapshot().shuffleOrder).toEqual([]);
  });

  it("opens one panel at a time, so two never overlap", async () => {
    const store = await freshStore();

    store.actions.toggleDevices();
    expect(store.getSnapshot().devicesOpen).toBe(true);

    store.actions.toggleModes();
    expect(store.getSnapshot().devicesOpen).toBe(false);
    expect(store.getSnapshot().modesOpen).toBe(true);

    store.actions.toggleQueue();
    expect(store.getSnapshot().modesOpen).toBe(false);
    expect(store.getSnapshot().queueOpen).toBe(true);
  });

  it("closes the menus when the stage goes fullscreen", async () => {
    const store = await freshStore();
    store.actions.toggleModes();

    store.actions.toggleFullscreen();

    expect(store.getSnapshot().fullscreen).toBe(true);
    expect(store.getSnapshot().modesOpen).toBe(false);
    expect(store.getSnapshot().lyricsOpen).toBe(false);
  });

  it("opens lyrics on the full stage rather than behind it", async () => {
    const store = await freshStore();
    store.actions.toggleDevices();

    store.actions.openLyrics();

    expect(store.getSnapshot().fullscreen).toBe(true);
    expect(store.getSnapshot().lyricsOpen).toBe(true);
    expect(store.getSnapshot().devicesOpen).toBe(false);
  });

  it("toggles the lyrics pane shut again", async () => {
    const store = await freshStore();
    store.actions.openLyrics();

    store.actions.toggleLyrics();

    expect(store.getSnapshot().lyricsOpen).toBe(false);
  });

  it("shows and hides the signal chain", async () => {
    const store = await freshStore();

    store.actions.toggleChain();
    expect(store.getSnapshot().chainVisible).toBe(true);
    store.actions.toggleChain();
    expect(store.getSnapshot().chainVisible).toBe(false);
  });

  it("routes artwork through the proxy and leaves a track without any alone", async () => {
    const store = await freshStore();

    expect(store.actions.artworkFor(track("a", { artworkUrl: "https://art/x.jpg" }))).toBe("proxy:https://art/x.jpg");
    expect(store.actions.artworkFor(track("b"))).toBeNull();
  });
});

describe("player store modes", () => {
  it("remembers the chosen mode for the next visit", async () => {
    const store = await freshStore();

    store.actions.selectMode("compact");

    expect(store.getSnapshot().mode).toBe("compact");
    expect(window.localStorage.getItem(MODE_STORAGE_KEY)).toBe("compact");
  });

  it("closes the detached window when the listener leaves mini mode", async () => {
    const store = await freshStore();
    store.actions.selectMode("mini");

    store.actions.selectMode("normal");

    expect(miniWindow.close).toHaveBeenCalled();
  });

  it("falls back to the normal dock when the browser refuses the detached window", async () => {
    miniWindow.open.mockImplementation(async () => false);
    const store = await freshStore();

    store.actions.selectMode("mini");
    await vi.waitFor(() => expect(store.getSnapshot().mode).toBe("normal"));
  });

  it("returns to the normal dock when the listener closes the detached window", async () => {
    const detached: { close: (() => void) | null } = { close: null };
    miniWindow.open.mockImplementation(async (onClosed: () => void) => {
      detached.close = onClosed;
      return true;
    });
    const store = await freshStore();
    store.actions.selectMode("mini");
    await vi.waitFor(() => expect(detached.close).not.toBeNull());

    detached.close?.();

    expect(store.getSnapshot().mode).toBe("normal");
  });

  it("puts back a mode a reload can honour", async () => {
    window.localStorage.setItem(MODE_STORAGE_KEY, "compact");
    const store = await freshStore();

    store.actions.restoreMode();

    expect(store.getSnapshot().mode).toBe("compact");
  });

  it("refuses to put back mini, whose window needs a gesture no reload supplies", async () => {
    window.localStorage.setItem(MODE_STORAGE_KEY, "mini");
    const store = await freshStore();

    store.actions.restoreMode();

    expect(store.getSnapshot().mode).toBe("normal");
  });
});

describe("player store session restore", () => {
  it("arms the saved queue without sounding it", async () => {
    const store = await freshStore();

    store.actions.restoreSession([track("a"), track("b")], "b", 44, null);

    expect(store.getSnapshot().index).toBe(1);
    expect(store.getSnapshot().playing).toBe(false);
    expect(store.getSnapshot().started).toBe(true);
    expect(engine.loadAt).toHaveBeenCalledWith("/api/v1/library/tracks/b/stream", 44, 0.8, false);
    expect(engine.loadAndPlay).not.toHaveBeenCalled();
  });

  it("names the client the session came from", async () => {
    const store = await freshStore();

    store.actions.restoreSession([track("a")], "a", 0, "Phone");

    expect(notices.announce).toHaveBeenCalledWith({ text: "resumed from Phone", tone: "info" });
  });

  it("starts at the top when the saved track is gone from the queue", async () => {
    const store = await freshStore();

    store.actions.restoreSession([track("a")], "vanished", 90, null);

    expect(store.getSnapshot().index).toBe(0);
    expect(store.getSnapshot().positionSeconds).toBe(0);
  });

  it("never resumes past the end of the track it saved", async () => {
    const store = await freshStore();

    store.actions.restoreSession([track("a", { durationSeconds: 100 })], "a", 400, null);

    expect(store.getSnapshot().positionSeconds).toBe(100);
  });

  it("leaves a session already under way alone", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("live")], 0);

    store.actions.restoreSession([track("saved")], "saved", 0, null);

    expect(store.getSnapshot().queue.map((entry) => entry.id)).toEqual(["live"]);
  });

  it("ignores an empty saved session", async () => {
    const store = await freshStore();

    store.actions.restoreSession([], null, 0, null);

    expect(store.getSnapshot().started).toBe(false);
  });

  it("starts sounding the queue handed over from another device", async () => {
    const store = await freshStore();

    store.actions.takeOver([track("a"), track("b")], "b", 30);

    expect(store.getSnapshot().index).toBe(1);
    expect(engine.loadAndPlay).toHaveBeenCalledWith("/api/v1/library/tracks/b/stream", 0.8, false, 30);
  });

  it("starts a hand-over at the top when the named track is not in it", async () => {
    const store = await freshStore();

    store.actions.takeOver([track("a")], "elsewhere", 30);

    expect(store.getSnapshot().index).toBe(0);
    expect(engine.loadAndPlay).toHaveBeenCalledWith("/api/v1/library/tracks/a/stream", 0.8, false, 0);
  });

  it("ignores an empty hand-over", async () => {
    const store = await freshStore();

    store.actions.takeOver([], null, 0);

    expect(store.getSnapshot().queue).toEqual([]);
  });

  it("ignores an empty play request", async () => {
    const store = await freshStore();

    store.actions.playQueue([], 0);

    expect(store.getSnapshot().started).toBe(false);
  });
});

describe("player store media keys", () => {
  it("wires the operating-system transport to the same actions as the dock", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 0);

    const handlers = lastMediaHandlers();
    handlers.next();
    expect(store.getSnapshot().index).toBe(1);

    handlers.previous();
    expect(store.getSnapshot().index).toBe(0);

    handlers.seekTo(25);
    expect(engine.seek).toHaveBeenCalledWith(25);

    engine.handlers?.onPlayingChange(true);
    handlers.pause();
    expect(engine.pause).toHaveBeenCalled();
  });
});
