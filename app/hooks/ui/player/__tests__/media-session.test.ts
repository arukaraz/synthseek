import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PlayerTrack } from "@components/Player";

import { ARTWORK_SIZES } from "../constants";
import { clearMediaSession, publishMediaSession, publishPlaybackState, publishPosition } from "../media-session";

vi.mock("@utils/artworkProxy", () => ({ artworkProxySrc: (value: string) => `proxy:${value}` }));

interface FakeSession {
  metadata: unknown;
  playbackState: string;
  setActionHandler: ReturnType<typeof vi.fn>;
  setPositionState?: ReturnType<typeof vi.fn>;
}

function fakeSession(overrides: Partial<FakeSession> = {}): FakeSession {
  return {
    metadata: null,
    playbackState: "none",
    setActionHandler: vi.fn(),
    setPositionState: vi.fn(),
    ...overrides,
  };
}

function install(session: FakeSession | null): void {
  if (session === null) {
    Reflect.deleteProperty(navigator, "mediaSession");
    return;
  }
  Object.defineProperty(navigator, "mediaSession", { value: session, configurable: true, writable: true });
}

function handlerFor(session: FakeSession, action: string): (details: { seekTime?: number }) => void {
  const call = session.setActionHandler.mock.calls.find(([name]) => name === action);
  if (call === undefined) throw new Error(`no handler registered for ${action}`);
  return call[1];
}

function track(overrides: Partial<PlayerTrack> = {}): PlayerTrack {
  return {
    id: "t1",
    title: "Digital Love",
    artist: "Daft Punk",
    album: "Discovery",
    durationSeconds: 301,
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

const handlers = {
  play: vi.fn(),
  pause: vi.fn(),
  next: vi.fn(),
  previous: vi.fn(),
  seekTo: vi.fn(),
};

class FakeMetadata {
  readonly title: string;
  readonly artist: string;
  readonly album: string;
  readonly artwork: readonly { src: string; sizes: string }[];

  constructor(init: { title: string; artist: string; album: string; artwork: { src: string; sizes: string }[] }) {
    this.title = init.title;
    this.artist = init.artist;
    this.album = init.album;
    this.artwork = init.artwork;
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("MediaMetadata", FakeMetadata);
});

describe("publishMediaSession", () => {
  it("hands the operating system the track that is playing", () => {
    const session = fakeSession();
    install(session);

    publishMediaSession(track(), handlers);

    expect(session.metadata).toBeInstanceOf(FakeMetadata);
    expect(session.metadata).toMatchObject({ title: "Digital Love", artist: "Daft Punk", album: "Discovery" });
  });

  it("offers the artwork at every size the system might ask for", () => {
    const session = fakeSession();
    install(session);

    publishMediaSession(track({ artworkUrl: "https://art/cover.jpg" }), handlers);

    const metadata = session.metadata;
    expect(metadata).toBeInstanceOf(FakeMetadata);
    if (!(metadata instanceof FakeMetadata)) return;
    expect(metadata.artwork.map((image) => image.sizes)).toEqual([...ARTWORK_SIZES]);
    expect(metadata.artwork.every((image) => image.src === "proxy:https://art/cover.jpg")).toBe(true);
  });

  it("offers no artwork for a track that has none", () => {
    const session = fakeSession();
    install(session);

    publishMediaSession(track(), handlers);

    const metadata = session.metadata;
    if (!(metadata instanceof FakeMetadata)) throw new Error("no metadata was published");
    expect(metadata.artwork).toEqual([]);
  });

  it("wires the hardware keys to the player", () => {
    const session = fakeSession();
    install(session);

    publishMediaSession(track(), handlers);

    handlerFor(session, "play")({});
    handlerFor(session, "pause")({});
    handlerFor(session, "nexttrack")({});
    handlerFor(session, "previoustrack")({});

    expect(handlers.play).toHaveBeenCalled();
    expect(handlers.pause).toHaveBeenCalled();
    expect(handlers.next).toHaveBeenCalled();
    expect(handlers.previous).toHaveBeenCalled();
  });

  it("follows a scrub from the system's own transport", () => {
    const session = fakeSession();
    install(session);
    publishMediaSession(track(), handlers);

    handlerFor(session, "seekto")({ seekTime: 42 });

    expect(handlers.seekTo).toHaveBeenCalledWith(42);
  });

  it("ignores a scrub the system sent without a position", () => {
    const session = fakeSession();
    install(session);
    publishMediaSession(track(), handlers);

    handlerFor(session, "seekto")({});

    expect(handlers.seekTo).not.toHaveBeenCalled();
  });

  it("survives a browser that refuses one of the actions", () => {
    const session = fakeSession({
      setActionHandler: vi.fn((action: string) => {
        if (action === "seekto") throw new Error("unsupported action");
      }),
    });
    install(session);

    expect(() => publishMediaSession(track(), handlers)).not.toThrow();
    expect(session.metadata).toBeInstanceOf(FakeMetadata);
  });

  it("does nothing on a browser with no media session at all", () => {
    install(null);

    expect(() => publishMediaSession(track(), handlers)).not.toThrow();
  });
});

describe("publishPlaybackState", () => {
  it("tells the system whether sound is coming out", () => {
    const session = fakeSession();
    install(session);

    publishPlaybackState(true);
    expect(session.playbackState).toBe("playing");

    publishPlaybackState(false);
    expect(session.playbackState).toBe("paused");
  });

  it("does nothing on a browser with no media session", () => {
    install(null);

    expect(() => publishPlaybackState(true)).not.toThrow();
  });
});

describe("publishPosition", () => {
  it("reports the position against the track length", () => {
    const session = fakeSession();
    install(session);

    publishPosition(300, 120, true);

    expect(session.setPositionState).toHaveBeenCalledWith({ duration: 300, position: 120, playbackRate: 1 });
  });

  it("reports a paused track as standing still", () => {
    const session = fakeSession();
    install(session);

    publishPosition(300, 120, false);

    expect(session.setPositionState).toHaveBeenCalledWith({ duration: 300, position: 120, playbackRate: 0 });
  });

  it("never reports a negative position", () => {
    const session = fakeSession();
    install(session);

    publishPosition(300, -4, true);

    expect(session.setPositionState).toHaveBeenCalledWith({ duration: 300, position: 0, playbackRate: 1 });
  });

  it("stays quiet while the track length is still unknown", () => {
    const session = fakeSession();
    install(session);

    publishPosition(0, 10, true);

    expect(session.setPositionState).not.toHaveBeenCalled();
  });

  it("stays quiet when the position runs past the length, which the system rejects", () => {
    const session = fakeSession();
    install(session);

    publishPosition(300, 305, true);

    expect(session.setPositionState).not.toHaveBeenCalled();
  });

  it("survives a browser that rejects the position outright", () => {
    const session = fakeSession({
      setPositionState: vi.fn(() => {
        throw new Error("invalid state");
      }),
    });
    install(session);

    expect(() => publishPosition(300, 120, true)).not.toThrow();
  });

  it("does nothing on a browser whose media session cannot carry a position", () => {
    const session = fakeSession();
    Reflect.deleteProperty(session, "setPositionState");
    install(session);

    expect(() => publishPosition(300, 120, true)).not.toThrow();
  });
});

describe("clearMediaSession", () => {
  it("takes the track off the system transport", () => {
    const session = fakeSession({ metadata: {}, playbackState: "playing" });
    install(session);

    clearMediaSession();

    expect(session.metadata).toBeNull();
    expect(session.playbackState).toBe("none");
  });

  it("does nothing on a browser with no media session", () => {
    install(null);

    expect(() => clearMediaSession()).not.toThrow();
  });
});
