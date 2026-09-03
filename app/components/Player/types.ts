export type PlayerTone = "primary" | "secondary" | "accent";

export type PlayerRepeat = "off" | "all" | "one";

export type PlayerNoticeTone = "info" | "warning" | "danger";

export type PlayerScrobbleStatus = "idle" | "retrying" | "failed";

export type PlayerDeviceKind = "own" | "third" | "unarmed";

export interface PlayerNotice {
  text: string;
  tone: PlayerNoticeTone;
}

export interface PlayerDevice {
  id: string;
  name: string;
  detail: string;
  kind: PlayerDeviceKind;
  active: boolean;
  local: boolean;
}

export interface PlayerTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationSeconds: number;
  format: string;
  bitrateKbps: number;
  lossless: boolean;
  tone: PlayerTone;
  missing: boolean;
}

export interface PlayerSignalChain {
  fileLabel: string;
  transcoding: boolean;
  serverLabel: string;
  normalizationLabel: string | null;
}

export interface PlayerScrobble {
  enabled: boolean;
  status: PlayerScrobbleStatus;
}

export interface PlayerView {
  track: PlayerTrack;
  positionSeconds: number;
  scrubSeconds: number | null;
  playing: boolean;
  loading: boolean;
  favorite: boolean;
  shuffle: boolean;
  repeat: PlayerRepeat;
  volume: number;
  muted: boolean;
  devices: readonly PlayerDevice[];
  activeDevice: PlayerDevice;
  chain: PlayerSignalChain;
  scrobble: PlayerScrobble;
  chainVisible: boolean;
  devicesOpen: boolean;
  fullscreen: boolean;
  notice: PlayerNotice | null;
}

export interface PlayerActions {
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (seconds: number) => void;
  scrubTo: (seconds: number | null) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFavorite: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleDevices: () => void;
  toggleChain: () => void;
  toggleScrobble: () => void;
  toggleFullscreen: () => void;
  selectDevice: (id: string) => void;
  describeChain: () => void;
}

export interface PlayerProps {
  view: PlayerView;
  actions: PlayerActions;
}

export interface PlayerPanelProps extends PlayerProps {
  chain: boolean;
}

export interface PlayerNoticeProps extends PlayerNotice {
  chain: boolean;
}

export interface PlayerWaveProps extends PlayerProps {
  size: "bar" | "stage";
}

export interface PlayerCoverProps {
  initials: string;
  tone: PlayerTone;
  size: "row" | "bar" | "stage";
}
