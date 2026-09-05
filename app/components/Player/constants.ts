export const WAVE = {
  VIEWBOX_WIDTH: 1200,
  VIEWBOX_HEIGHT: 100,
  CENTER: 50,
  SEGMENTS: 96,
  LOBE_AMPLITUDES: [37, 35, 34],
  LOBE_PHASES: [0, 2.3, 4.6],
  LOBE_CENTERS: [0.27, 0.46, 0.66],
  TAPER_EXPONENT: 0.7,
  BULGE_WIDTH: 0.17,
  RIPPLE_SHARE: 0.45,
} as const;

export const WAVE_CACHE_LIMIT = 60;

export const WAVE_LAYERS = ["rest", "played"] as const;

export const WAVE_LOBES = ["a", "b", "c"] as const;

export const SEEK_STEP_SECONDS = 5;

export const SEEK_PAGE_SECONDS = 30;

export const VOLUME_STEP = 0.05;

export const RESTART_THRESHOLD_SECONDS = 3;

export const DEVICES_TOGGLE_SELECTOR = "[data-player-devices-toggle]";

export const FULLSCREEN_TOGGLE_SELECTOR = "[data-player-fullscreen-toggle]";
