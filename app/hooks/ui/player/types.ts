import type { AppRouter } from "@api/__generated__/types";
import type {
  PlayerDeviceKind,
  PlayerMode,
  PlayerRepeat,
  PlayerTrack,
  PlayerTransition,
  TransitionCurve,
} from "@components/Player";
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
  devicesOpen: boolean;
  settingsOpen: boolean;
  equalizer: EqualizerSettings;
  equalizerPresets: readonly EqualizerCustomPreset[];
  compressor: CompressorSettings;
  conversion: ConversionSettings;
  transition: PlayerTransition;
  modesOpen: boolean;
  queueOpen: boolean;
  mode: PlayerMode;
  lyricsOpen: boolean;
  fullscreen: boolean;
  consecutiveFailures: number;
  started: boolean;
}

export interface EqualizerSettings {
  enabled: boolean;
  gainsDb: readonly number[];
  preampDb: number;
}

export interface EqualizerCustomPreset {
  name: string;
  gainsDb: readonly number[];
}

export interface CompressorParams {
  thresholdDb: number;
  ratio: number;
  attackMs: number;
  releaseMs: number;
  kneeDb: number;
}

export interface CompressorSettings extends CompressorParams {
  enabled: boolean;
}

export type CompressorParam = keyof CompressorParams;

export interface ConversionSettings {
  enabled: boolean;
  bitrateKbps: number;
}

export interface StreamConversion {
  format: string;
  bitrateKbps: number;
}

export interface EngineCallbacks {
  onProgress: (positionSeconds: number, durationSeconds: number) => void;
  onEnded: () => void;
  onHandoff: (url: string) => void;
  onPlayingChange: (playing: boolean) => void;
  onLoadingChange: (loading: boolean) => void;
  onFailure: (reason: "load" | "stall" | "autoplay") => void;
}

export interface PrimePlan {
  url: string;
  gainFactor: number;
  fadeSeconds: number;
  curve: TransitionCurve;
}

export interface SkipFade {
  seconds: number;
  curve: TransitionCurve;
  gainFactor: number;
}

export type FadeDirection = "in" | "out";

export type TransitionReason = "ended" | "skip";

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

export interface PcmVoiceKey {
  readonly voice: number;
}

export type DeckKey = HTMLAudioElement | PcmVoiceKey;

export interface AudioDeck {
  source: MediaElementAudioSourceNode | null;
  gain: GainNode;
}

export interface AudioBus {
  context: AudioContext;
  gain: GainNode;
}

export interface GaplessInfo {
  delaySamples: number;
  paddingSamples: number;
  frames: number;
  samplesPerFrame: number;
}

export interface PcmTrim {
  startSeconds: number;
  durationSeconds: number;
}

export interface PcmBuffer {
  buffer: AudioBuffer;
  timestamp: number;
  duration: number;
}

export interface PcmSource {
  durationSeconds: number;
  sampleRate: number;
  trimStartSeconds: number;
  buffers: (fromSeconds: number) => AsyncGenerator<PcmBuffer, void, unknown>;
  dispose: () => void;
}

export interface BufferClip {
  startSeconds: number;
  offsetSeconds: number;
  playSeconds: number;
}

export interface EngineBackend {
  canPlayMime: (mimeType: string) => boolean;
  connectEngine: (next: EngineCallbacks) => void;
  loadAndPlay: (url: string, volume: number, muted: boolean, startSeconds?: number) => number;
  crossfadeTo: (url: string, fade: SkipFade, volume: number, muted: boolean, startSeconds?: number) => number;
  loadAt: (url: string, seconds: number, volume: number, muted: boolean) => void;
  prime: (plan: PrimePlan) => void;
  cancelPrime: () => void;
  primedUrl: () => string | null;
  setActiveTrackGain: (factor: number) => void;
  resume: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  applyVolume: (volume: number, muted: boolean) => void;
  stop: () => void;
}

export interface AudioGraph {
  context: AudioContext;
  analyser: AnalyserNode;
  gain: GainNode;
  preamp: GainNode;
  filters: readonly BiquadFilterNode[];
  compressor: DynamicsCompressorNode;
  compressorEngaged: boolean;
  decks: Map<DeckKey, AudioDeck>;
}

export interface AudioOutput {
  volume: number;
  muted: boolean;
  headroom: number;
}

export type LoudnessMode = "track" | "album";

export interface LoudnessPreferences {
  enabled: boolean;
  preAmpDb: number;
}

export interface QueueAddOutcome {
  added: number;
  skipped: number;
  full: boolean;
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
