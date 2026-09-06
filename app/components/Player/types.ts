export type PlayerTone = "primary" | "secondary" | "accent";

export type PlayerRepeat = "off" | "all" | "one";

export type PlayerNoticeTone = "info" | "warning" | "danger";

export interface PlayerNotice {
  text: string;
  tone: PlayerNoticeTone;
}

export type PlayerDeviceKind = "computer" | "phone" | "tablet";

export interface PlayerDevice {
  id: string;
  name: string;
  kind: PlayerDeviceKind;
  active: boolean;
  local: boolean;
  armed: boolean;
  playing: boolean;
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

export type PlayerScrobbleState = "off" | "sending" | "retrying" | "failed";

export type PlayerMode = "normal" | "compact" | "mini";

export interface PlayerLyricsLine {
  start: number | null;
  value: string;
}

export interface PlayerLyrics {
  synced: boolean;
  lines: readonly PlayerLyricsLine[];
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
  favorite: boolean;
  chainVisible: boolean;
  devicesOpen: boolean;
  lyricsOpen: boolean;
  lyrics: PlayerLyrics | null;
  lyricsLoading: boolean;
  lyricsFailure: string | null;
  scrobble: PlayerScrobbleState;
  scrobbleActionable: boolean;
  moreOpen: boolean;
  modesOpen: boolean;
  mode: PlayerMode;
  fullscreen: boolean;
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
  toggleModes: () => void;
  selectMode: (mode: PlayerMode) => void;
  toggleMore: () => void;
  toggleChain: () => void;
  toggleLyrics: () => void;
  openLyrics: () => void;
  toggleScrobbling: () => void;
  toggleFullscreen: () => void;
  toggleFavorite: () => void;
  handOverTo: (deviceId: string) => void;
  playHere: () => void;
}

export interface PlayerProps {
  view: PlayerView;
  actions: PlayerActions;
}

export interface PlayerBarProps extends PlayerProps {
  placement?: "dock" | "header";
}

export interface PlayerDeviceBodyProps {
  device: PlayerDevice;
}

export interface PlayerPanelProps extends PlayerProps {
  chain: boolean;
  anchored?: boolean;
}

export interface PanelAnchorPoint {
  top: number;
  left: number;
}

export interface PlayerPlacement {
  target: HTMLElement | null;
  effective: PlayerMode;
}

export interface PlayerTransportProps extends PlayerProps {
  size: "bar" | "stage" | "mini";
}

export interface PlayerExtraControlsProps extends PlayerProps {
  omitTransport?: boolean;
}

export interface PlayerWaveProps extends PlayerProps {
  size: "bar" | "stage";
}

export interface WaveGradient {
  addColorStop(offset: number, color: string): void;
}

export interface WavePattern {
  setTransform(transform?: DOMMatrix2DInit): void;
}

export type WaveStyle = string | WaveGradient | WavePattern;

export interface WaveCanvas {
  width: number;
  height: number;
  getContext(contextId: "2d"): WaveSurface | null;
}

export interface WaveSurface {
  fillStyle: WaveStyle;
  strokeStyle: WaveStyle;
  shadowColor: string;
  shadowBlur: number;
  globalAlpha: number;
  lineWidth: number;
  font: string;
  textBaseline: string;
  textAlign: string;
  globalCompositeOperation: string;
  save(): void;
  restore(): void;
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
  clearRect(x: number, y: number, width: number, height: number): void;
  fillRect(x: number, y: number, width: number, height: number): void;
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  arc(x: number, y: number, radius: number, start: number, end: number): void;
  roundRect(x: number, y: number, width: number, height: number, radii: number): void;
  stroke(): void;
  fill(): void;
  fillText(text: string, x: number, y: number): void;
  measureText(text: string): { width: number };
  createLinearGradient(x0: number, y0: number, x1: number, y1: number): WaveGradient;
  drawImage(image: WaveCanvas | CanvasImageSource, x: number, y: number, width: number, height: number): void;
  setLineDash(segments: number[]): void;
}

export interface WaveColors {
  lobes: readonly string[];
  primary: string;
  foreground: string;
  surface: string;
  primaryForeground: string;
  mono: string;
}

export interface WaveSnapshot {
  phase: number;
  progress: number;
  origin: number | null;
  hover: number | null;
  dragging: boolean;
  playing: boolean;
  loading: boolean;
  label: string;
}

export interface WavePaint extends WaveSnapshot {
  width: number;
  height: number;
  ratio: number;
  time: number;
  energy: number;
  colors: WaveColors;
}

export interface PlayerVolumeProps extends PlayerProps {
  size: "bar" | "stage";
}

export interface PlayerFavouriteProps extends PlayerProps {
  className?: string;
}

export interface PlayerScrobbleProps {
  state: PlayerScrobbleState;
  actionable: boolean;
  size: "bar" | "stage";
  onToggle: () => void;
}

export type PlayerLyricsProps = PlayerProps;

export interface PlayerCoverProps {
  initials: string;
  tone: PlayerTone;
  size: "row" | "bar" | "stage";
  artworkUrl?: string | null;
}
