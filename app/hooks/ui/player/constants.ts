import type {
  CompressorPresetId,
  EqualizerPresetId,
  PlayerSource,
  TransitionCurve,
  TransitionMode,
} from "@components/Player";

import type { CompressorParam, CompressorParams } from "./types";

export const LOAD_TIMEOUT_MS = 15000;

export const STALL_TIMEOUT_MS = 15000;

export const MAX_CONSECUTIVE_FAILURES = 3;

export const SKIP_DELAY_MS = 1200;

export const VOLUME_STORAGE_KEY = "synthseek.player.volume";

export const ARTWORK_SIZES = ["96x96", "192x192", "512x512"] as const;

export const CONVERTED_FORMAT = "mp3";

export const CONVERTED_BITRATE_KBPS = 320;

export const PLAYBACK_MIME_BY_FORMAT: Readonly<Record<string, string>> = {
  mp3: "audio/mpeg",
  flac: "audio/flac",
  m4a: "audio/mp4",
  alac: "audio/mp4",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  opus: "audio/opus",
  aac: "audio/aac",
  wav: "audio/wav",
};

export const TONES = ["primary", "secondary", "accent"] as const;

export const MAX_QUEUE_TRACKS = 500;

export const AUTOPLAY_REFILL_BELOW = 3;

export const AUTOPLAY_BATCH = 10;

export const AUTOPLAY_STATION_SIZE = 25;

export const AUTOPLAY_SEED_LIMIT = 3;

export const SESSION_SAVE_INTERVAL_MS = 10_000;

export const SESSION_POSITION_DRIFT_MS = 5_000;

export const DEVICE_ID_STORAGE_KEY = "synthseek.player.device";

export const DEVICE_CLAIM_CHANNEL = "synthseek.player.devices";

export const DEVICE_HEARTBEAT_MS = 15_000;

export const MIRROR_TICK_MS = 1_000;

export const POSITION_JUMP_SECONDS = 3;

export const PROGRESS_REPORT_MS = 10_000;

export const MIRROR_STALE_MS = 45_000;

export const HAND_OVER_ACK_MS = 8_000;

export const WAKE_BEAT_FLOOR_MS = 3_000;

export const LISTEN_DELTA_CEILING_SECONDS = 3;

export const LISTEN_MAX_SECONDS = 240;

export const LISTEN_FRACTION = 0.5;

export const MODE_STORAGE_KEY = "synthseek.player.mode";

export const WAVE_FFT_SIZE = 2048;

export const WAVE_BASS_LOW_HZ = 20;

export const WAVE_BASS_HIGH_HZ = 160;

export const WAVE_ENERGY_INTERVAL_MS = 40;

export const WAVE_ANALYSER_SMOOTHING = 0.12;

export const WAVE_ENERGY_FLOOR = 0.3;

export const WAVE_ENERGY_CEILING = 1.5;

export const WAVE_ENERGY_CURVE = 2.2;

export const WAVE_ENERGY_PEAK_DECAY = 0.966;

export const WAVE_ENERGY_SILENCE = 0.01;

export const WAVE_ENERGY_SMOOTHING = 0.55;

export const NO_GAIN_FACTOR = 1;

export const NO_REPLAY_GAIN = {
  trackGain: null,
  albumGain: null,
  trackPeak: null,
  albumPeak: null,
} as const;

export const NO_ALBUM_ID = "";

export const NO_SOURCES: readonly PlayerSource[] = [];

export const LOSSLESS_FORMATS: readonly string[] = ["flac", "wav", "alac"];

export const LOCAL_SOURCE = "local";

export const GAIN_RAMP_SECONDS = 0.05;

export const EQUALIZER_Q = 1.41;

export const EQUALIZER_RESPONSE_SAMPLE_RATE = 48_000;

export const EQUALIZER_RESPONSE_MIN_HZ = 20;

export const EQUALIZER_RESPONSE_MAX_HZ = 20_000;

export const EQUALIZER_RESPONSE_POINTS_PER_OCTAVE = 24;

export const EQUALIZER_STORAGE_KEY = "synthseek.player.equalizer";

export const EQUALIZER_PRESETS_STORAGE_KEY = "synthseek.player.equalizer.presets";

export const COMPRESSOR_STORAGE_KEY = "synthseek.player.compressor";

export const CONVERSION_STORAGE_KEY = "synthseek.player.conversion";

export const TRANSITION_STORAGE_KEY = "synthseek.player.transition";

export const TRANSITION_MODES = ["gapless", "crossfade", "smart"] as const satisfies readonly TransitionMode[];

export const TRANSITION_CURVES = ["equalPower", "linear"] as const satisfies readonly TransitionCurve[];

export const TRANSITION_MIN_SECONDS = 1;

export const TRANSITION_MAX_SECONDS = 12;

export const TRANSITION_STEP_SECONDS = 1;

export const TRANSITION_DEFAULT_SECONDS = 5;

export const CROSSFADE_MIN_TRACK_RATIO = 2;

export const PRIME_AHEAD_SECONDS = 20;

export const HANDOFF_LEAD_SECONDS = 0.01;

export const SEAM_FADE_SECONDS = 0.01;

export const HANDOFF_WATCH_SECONDS = 2;

export const HANDOFF_POLL_MS = 4;

export const FADE_CURVE_POINTS = 64;

export const OUTGOING_RELEASE_MARGIN_MS = 250;

export const PCM_LEAD_SECONDS = 8;

export const PCM_FEED_TICK_MS = 100;

export const PCM_PROGRESS_MS = 250;

export const PCM_START_LEAD_SECONDS = 0.05;

export const PCM_URL_CACHE_BYTES = 16 * 1024 * 1024;

export const PCM_READ_RETRIES = 2;

export const PCM_NETWORK_RETRY_MAX_SECONDS = 16;

export const MP3_HEAD_BYTES = 4096;
export const MP3_XING_WINDOW_BYTES = 512;

export const MP3_DECODER_DELAY_SAMPLES = 529;

export const MP3_SAMPLES_PER_FRAME_MPEG1 = 1152;

export const MP3_SAMPLES_PER_FRAME_MPEG2 = 576;

export const PCM_CODEC_PROBES: readonly { mime: string; config: AudioDecoderConfig }[] = [
  { mime: "audio/mpeg", config: { codec: "mp3", sampleRate: 44100, numberOfChannels: 2 } },
  {
    mime: "audio/flac",
    config: { codec: "flac", sampleRate: 44100, numberOfChannels: 2, description: new Uint8Array(34) },
  },
  { mime: "audio/mp4", config: { codec: "mp4a.40.2", sampleRate: 44100, numberOfChannels: 2 } },
  { mime: "audio/aac", config: { codec: "mp4a.40.2", sampleRate: 44100, numberOfChannels: 2 } },
  { mime: "audio/opus", config: { codec: "opus", sampleRate: 48000, numberOfChannels: 2 } },
  { mime: "audio/ogg", config: { codec: "vorbis", sampleRate: 44100, numberOfChannels: 2 } },
];

export const PCM_REQUIRED_MIMES: readonly string[] = ["audio/mpeg", "audio/flac"];

export const PCM_NATIVE_MIMES: ReadonlySet<string> = new Set(["audio/wav"]);

export const KEEPALIVE_SAMPLE_RATE = 8000;

export const KEEPALIVE_SECONDS = 1;

export const EQUALIZER_MAX_CUSTOM_PRESETS = 20;

export const EQUALIZER_PRESET_NAME_MAX_LENGTH = 40;

export const COMPRESSOR_LIMITS: Readonly<Record<CompressorParam, { min: number; max: number; step: number }>> = {
  thresholdDb: { min: -60, max: 0, step: 1 },
  ratio: { min: 1, max: 20, step: 0.5 },
  attackMs: { min: 0, max: 200, step: 1 },
  releaseMs: { min: 0, max: 1000, step: 10 },
  kneeDb: { min: 0, max: 40, step: 1 },
};

export const COMPRESSOR_PARAMS: readonly CompressorParam[] = [
  "thresholdDb",
  "ratio",
  "attackMs",
  "releaseMs",
  "kneeDb",
];

export const COMPRESSOR_PRESETS: Readonly<Record<CompressorPresetId, CompressorParams>> = {
  gentle: { thresholdDb: -15, ratio: 1.5, attackMs: 50, releaseMs: 500, kneeDb: 6 },
  light: { thresholdDb: -18, ratio: 2, attackMs: 30, releaseMs: 400, kneeDb: 4 },
  moderate: { thresholdDb: -24, ratio: 4, attackMs: 20, releaseMs: 300, kneeDb: 3 },
  heavy: { thresholdDb: -30, ratio: 8, attackMs: 10, releaseMs: 150, kneeDb: 2 },
  broadcast: { thresholdDb: -20, ratio: 5, attackMs: 15, releaseMs: 200, kneeDb: 3 },
  loudMaster: { thresholdDb: -28, ratio: 6, attackMs: 5, releaseMs: 100, kneeDb: 2 },
  limiter: { thresholdDb: -3, ratio: 20, attackMs: 1, releaseMs: 100, kneeDb: 1 },
};

export const COMPRESSOR_DEFAULT_PRESET: CompressorPresetId = "moderate";

export const CONVERSION_BITRATES_KBPS: readonly number[] = [128, 192, 256, 320];

export const CONVERSION_DEFAULT_BITRATE_KBPS = 192;

export const EQUALIZER_BANDS_HZ: readonly number[] = [31.5, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQUALIZER_MIN_DB = -12;

export const EQUALIZER_MAX_DB = 12;

export const EQUALIZER_STEP_DB = 0.5;

export const EQUALIZER_PRESETS: Readonly<Record<EqualizerPresetId, readonly number[]>> = {
  flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  acoustic: [3, 2, 1, 1, 0, 0, 1, 2, 3, 2],
  bassBoost: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
  classical: [4, 3, 2, 1, -1, -1, 0, 2, 3, 4],
  electronic: [5, 4, 2, 0, -2, 1, 3, 4, 5, 4],
  hipHop: [5, 4, 2, 1, 0, -1, 0, 1, 2, 3],
  jazz: [3, 2, 1, 2, -1, -1, 0, 1, 3, 4],
  pop: [-1, 1, 3, 4, 3, 0, -1, -1, 2, 3],
  rock: [5, 4, 3, 1, -1, 1, 3, 4, 5, 5],
  trebleBoost: [0, 0, 0, 0, 0, 0, 2, 4, 6, 8],
  vocal: [-2, -1, 0, 2, 4, 4, 3, 1, 0, -1],
};
