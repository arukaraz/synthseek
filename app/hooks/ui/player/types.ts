import type { PlayerNotice, PlayerRepeat, PlayerTrack } from "@components/Player";

export type PlayerDockState = "hidden" | "bar" | "chain";

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
  offsetSeconds: number;
  chainVisible: boolean;
  moreOpen: boolean;
  devicesOpen: boolean;
  fullscreen: boolean;
  notice: PlayerNotice | null;
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
