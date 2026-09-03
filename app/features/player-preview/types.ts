import type {
  PlayerActions,
  PlayerNotice,
  PlayerRepeat,
  PlayerScrobbleStatus,
  PlayerTrack,
  PlayerView,
} from "@components/Player";

export type DemoDeviceId = "here" | "desktop" | "phone" | "laptop";

export interface PlayerDemo {
  view: PlayerView;
  actions: PlayerActions;
  tracks: readonly PlayerTrack[];
  playTrack: (id: string) => void;
  addNext: (id: string) => void;
  addLast: (id: string) => void;
}

export interface PlayerDemoState {
  index: number;
  playing: boolean;
  started: boolean;
  loading: boolean;
  positionSeconds: number;
  scrubSeconds: number | null;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: PlayerRepeat;
  favoriteIds: readonly string[];
  queueIds: readonly string[];
  devicesOpen: boolean;
  fullscreen: boolean;
  chainVisible: boolean;
  deviceId: string;
  scrobbleEnabled: boolean;
  scrobbleStatus: PlayerScrobbleStatus;
  transcoding: boolean;
  notice: PlayerNotice | null;
}
