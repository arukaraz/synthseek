import type { AppRouter } from "@api/__generated__/types";
import type { PlayerDeviceKind, PlayerMode, PlayerRepeat, PlayerTrack } from "@components/Player";
import type { inferRouterOutputs } from "@trpc/server";

export type ListeningConnectionStatus = inferRouterOutputs<AppRouter>["playback"]["scrobble"]["connections"][number];

export type PlayerDockState = "hidden" | "bar" | "chain";

export interface RemotePlayback {
  deviceId: string;
  confirmed: boolean;
  deviceName: string;
  playing: boolean;
  track: PlayerTrack | null;
  positionSeconds: number;
  shuffle: boolean;
  repeat: PlayerRepeat;
  volume: number;
  muted: boolean;
  transcoding: boolean;
  updatedAt: number;
}

export interface PlayerSessionState {
  queue: readonly PlayerTrack[];
  index: number;
  playing: boolean;
  loading: boolean;
  positionSeconds: number;
  durationSeconds: number;
  scrubSeconds: number | null;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  shuffleOrder: readonly number[];
  repeat: PlayerRepeat;
  transcoding: boolean;
  armed: boolean;
  remote: RemotePlayback | null;
  offsetSeconds: number;
  chainVisible: boolean;
  moreOpen: boolean;
  devicesOpen: boolean;
  modesOpen: boolean;
  mode: PlayerMode;
  lyricsOpen: boolean;
  fullscreen: boolean;
  consecutiveFailures: number;
  started: boolean;
}

export interface EngineCallbacks {
  onProgress: (positionSeconds: number, durationSeconds: number) => void;
  onEnded: () => void;
  onPlayingChange: (playing: boolean) => void;
  onLoadingChange: (loading: boolean) => void;
  onFailure: (reason: "load" | "stall" | "autoplay") => void;
}

export interface SessionSnapshot {
  trackIds: string[];
  currentTrackId: string | null;
  positionMs: number;
}

export interface ListenProgress {
  trackId: string;
  startedAt: number;
  listenedSeconds: number;
  lastPositionSeconds: number;
  recorded: boolean;
}

export interface KnownDevice {
  id: string;
  name: string;
  kind: PlayerDeviceKind;
  armed: boolean;
  playing: boolean;
  trackTitle: string | null;
}

export type RemoteCommand =
  | "play"
  | "pause"
  | "next"
  | "previous"
  | "seek"
  | "toggleShuffle"
  | "cycleRepeat"
  | "toggleMute"
  | "setVolume";
