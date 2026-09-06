export const WAVE = {
  LOBES: [
    { amplitude: 1, frequency: 1.5, speed: 1 },
    { amplitude: 0.74, frequency: 2.4, speed: -1.35 },
    { amplitude: 0.52, frequency: 3.3, speed: 1.75 },
  ],
  LOBE_PHASE_STEP: 1.1,
  SAMPLE_STEP_PX: 3,
  ENVELOPE_EXPONENT: 3,
  HEIGHT_SHARE: 0.4,
  LINE_WIDTH_SHARE: 0.055,
  MIN_LINE_WIDTH_PX: 2.4,
  LIMIT_KNEE: 0.86,
  GLOW_SHARE: 0.24,
  PLAYED_ALPHA: 0.34,
  REST_ALPHA: 0.1,
  REST_AMPLITUDE_SHARE: 0.9,
  FADE_SHARE: 0.12,
  MIN_FADE_PX: 6,
  FADE_MIDPOINT_ALPHA: 0.55,
  BASELINE_ALPHA: 0.7,
  BASELINE_LIT_HEIGHT_PX: 2,
  BASELINE_GLOW_PX: 7,
  HEAD_SHARE: 0.075,
  MIN_HEAD_PX: 3.2,
  HEAD_GLOW_PX: 12,
  HOVER_HEAD_SCALE: 1.15,
  DRAG_HEAD_SCALE: 1.45,
  DRAG_GAIN: 1.3,
  ORIGIN_ALPHA: 0.32,
  ORIGIN_DASH_PX: [3, 3],
  TAG_INSET_PX: 2,
  TAG_HOVER_FONT_PX: 11,
  TAG_HOVER_PADDING_PX: 12,
  TAG_HOVER_HEIGHT_PX: 18,
  TAG_DRAG_FONT_PX: 12,
  TAG_DRAG_PADDING_PX: 16,
  TAG_DRAG_HEIGHT_PX: 22,
  TAG_BORDER_ALPHA: 0.4,
  TAG_TEXT_ALPHA: 0.85,
  MAX_PIXEL_RATIO: 2,
} as const;

export const PROGRESS_FOLLOW_MS = 120;

export const ENERGY_ATTACK_MS = 22;

export const ENERGY_RELEASE_MS = 190;

export const PROGRESS_SNAP_FRACTION = 0.25;

export const SETTLE_EPSILON = 0.0005;

export const FRAME_CEILING_MS = 100;

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const SEEK_STEP_SECONDS = 5;

export const SEEK_PAGE_SECONDS = 30;

export const VOLUME_STEP = 0.02;

export const RESTART_THRESHOLD_SECONDS = 3;

export const DEVICES_TOGGLE_SELECTOR = "[data-player-devices-toggle]";

export const FULLSCREEN_TOGGLE_SELECTOR = "[data-player-fullscreen-toggle]";

export const LYRIC_SCROLL_SPRING = { type: "spring", stiffness: 110, damping: 24, mass: 0.7 } as const;

export const LYRIC_BLUR_DISTANCE = 2;

export const LYRIC_FAR_DISTANCE = 4;
