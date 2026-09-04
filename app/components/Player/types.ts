export type PlayerTone = "primary" | "secondary" | "accent";

export type PlayerRepeat = "off" | "all" | "one";

export type PlayerNoticeTone = "info" | "warning" | "danger";

export interface PlayerNotice {
  text: string;
  tone: PlayerNoticeTone;
}

export interface PlayerDevice {
  id: string;
  name: string;
  detail: string;
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
  artworkUrl: string | null;
}

export interface PlayerSignalChain {
  fileLabel: string;
  transcoding: boolean;
  serverLabel: string;
}

export interface PlayerView {
  track: PlayerTrack;
  positionSeconds: number;
  scrubSeconds: number | null;
  playing: boolean;
  loading: boolean;
  shuffle: boolean;
  repeat: PlayerRepeat;
  volume: number;
  muted: boolean;
  devices: readonly PlayerDevice[];
  activeDevice: PlayerDevice;
  chain: PlayerSignalChain;
  chainVisible: boolean;
  devicesOpen: boolean;
  moreOpen: boolean;
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
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleDevices: () => void;
  toggleMore: () => void;
  toggleChain: () => void;
  toggleFullscreen: () => void;
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
  artworkUrl?: string | null;
}
