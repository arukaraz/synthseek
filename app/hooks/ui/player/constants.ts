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

export const APP_TITLE = "Synthseek";

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
