import { vi } from "vitest";

import type { PlayerActions, PlayerDevice, PlayerTrack, PlayerView } from "@components/Player";

export const createPlayerTrack = (overrides: Partial<PlayerTrack> = {}): PlayerTrack => ({
  id: "track-1",
  title: "Digital Love",
  artist: "Daft Punk",
  album: "Discovery",
  albumId: "album-1",
  durationSeconds: 301,
  format: "flac",
  bitrateKbps: 1024,
  lossless: true,
  tone: "primary",
  artworkUrl: null,
  replayGain: { trackGain: null, albumGain: null, trackPeak: null, albumPeak: null },
  ...overrides,
});

export const createPlayerDevice = (overrides: Partial<PlayerDevice> = {}): PlayerDevice => ({
  id: "here",
  name: "This browser",
  kind: "computer",
  active: true,
  local: true,
  armed: true,
  playing: false,
  ...overrides,
});

export const createPlayerView = (overrides: Partial<PlayerView> = {}): PlayerView => {
  const track = overrides.track ?? createPlayerTrack();
  const here = createPlayerDevice();
  return {
    track,
    positionSeconds: 30,
    scrubSeconds: null,
    playing: false,
    loading: false,
    shuffle: false,
    repeat: "off",
    volume: 0.8,
    muted: false,
    devices: [here],
    activeDevice: here,
    chain: { fileLabel: "FLAC 1024 kbps", transcoding: false, serverLabel: "Direct" },
    favorite: false,
    chainVisible: false,
    devicesOpen: false,
    lyricsOpen: false,
    lyrics: null,
    lyricsLoading: false,
    lyricsFailure: null,
    scrobble: "off",
    scrobbleActionable: false,
    upgrading: false,
    moreOpen: false,
    modesOpen: false,
    queueOpen: false,
    queueEditable: true,
    queue: { playing: { index: 0, track }, upNext: [] },
    mode: "normal",
    fullscreen: false,
    ...overrides,
  };
};

export const createPlayerActions = (overrides: Partial<PlayerActions> = {}): PlayerActions => ({
  togglePlay: vi.fn(),
  next: vi.fn(),
  previous: vi.fn(),
  seekTo: vi.fn(),
  scrubTo: vi.fn(),
  setVolume: vi.fn(),
  toggleMute: vi.fn(),
  toggleShuffle: vi.fn(),
  cycleRepeat: vi.fn(),
  toggleDevices: vi.fn(),
  toggleModes: vi.fn(),
  toggleQueue: vi.fn(),
  selectMode: vi.fn(),
  jumpTo: vi.fn(),
  removeFromQueue: vi.fn(),
  reorderQueue: vi.fn(),
  toggleMore: vi.fn(),
  toggleChain: vi.fn(),
  toggleLyrics: vi.fn(),
  openLyrics: vi.fn(),
  toggleScrobbling: vi.fn(),
  searchBetterQuality: vi.fn(),
  toggleFullscreen: vi.fn(),
  toggleFavorite: vi.fn(),
  handOverTo: vi.fn(),
  playHere: vi.fn(),
  ...overrides,
});
