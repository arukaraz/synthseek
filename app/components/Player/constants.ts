import { LayoutTemplate, Monitor, PanelBottom, PanelTop, PictureInPicture2, Smartphone, Tablet } from "lucide-react";

import type { PlayerMode } from "./types";

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

export const MODES_TOGGLE_SELECTOR = "[data-player-modes-toggle]";

export const FULLSCREEN_TOGGLE_SELECTOR = "[data-player-fullscreen-toggle]";

export const SELECTABLE_PLAYER_MODES = ["compact", "mini"] as const;

export const RESTORABLE_PLAYER_MODES: readonly PlayerMode[] = ["normal", "compact"];

export const ALL_PLAYER_MODES: readonly [PlayerMode, PlayerMode, PlayerMode] = ["normal", "compact", "mini"];

export const MODE_ICONS = { compact: PanelTop, mini: PictureInPicture2 } as const;

export const MODE_MENU_ICON = LayoutTemplate;

export const RESTORE_MODE_ICON = PanelBottom;

export const DEVICE_ICONS = { computer: Monitor, phone: Smartphone, tablet: Tablet } as const;

export const PLAYER_HEADER_SLOT_ID = "player-header-slot";

export const PLAYER_MODE_ATTRIBUTE = "data-player-mode";

export const PLAYER_CONTAINER_REM = 40;

export const MINI_WINDOW_WIDTH_PX = 400;

export const MINI_HEADER_HEIGHT_PX = 58;

export const MINI_TRANSPORT_HEIGHT_PX = 56;

export const MINI_PROGRESS_HEIGHT_PX = 38;

export const MINI_CHEVRON_HEIGHT_PX = 26;

export const MINI_EXTRAS_HEIGHT_PX = 44;

export const MINI_LIST_CAPTION_HEIGHT_PX = 30;

export const MINI_LIST_ROW_HEIGHT_PX = 56;

export const MINI_FOOTER_HEIGHT_PX = 60;

export const MINI_LIST_ROWS_AT_OPEN = 3;

export const MINI_COLLAPSED_HEIGHT_PX =
  MINI_HEADER_HEIGHT_PX + MINI_TRANSPORT_HEIGHT_PX + MINI_PROGRESS_HEIGHT_PX + MINI_CHEVRON_HEIGHT_PX;

export const MINI_WINDOW_HEIGHT_PX =
  MINI_COLLAPSED_HEIGHT_PX +
  MINI_LIST_CAPTION_HEIGHT_PX +
  MINI_LIST_ROW_HEIGHT_PX * MINI_LIST_ROWS_AT_OPEN +
  MINI_FOOTER_HEIGHT_PX;

export const MINI_PLACEHOLDER_ROWS = 6;

export const APP_TITLE = "Synthseek";

export const MINI_QUEUE_ROUTE = "/library";

export const TRANSPORT_METRICS = {
  bar: {
    side: undefined,
    skip: "transport",
    play: "bar",
    mark: "size-3.5",
    arrow: "size-4",
    face: "size-3.5",
    folds: "@player:grid hidden",
  },
  stage: {
    side: "stage",
    skip: "stage",
    play: "stage",
    mark: "size-4",
    arrow: "size-5",
    face: "size-4.5",
    folds: undefined,
  },
  mini: {
    side: undefined,
    skip: "transport",
    play: "bar",
    mark: "size-3.5",
    arrow: "size-4",
    face: "size-3.5",
    folds: undefined,
  },
} as const;

export const MIRRORED_ROOT_ATTRIBUTES = ["data-theme", "lang"] as const;

export const PANEL_WIDTH_PX = 306;

export const PANEL_ANCHOR_GAP_PX = 10;

export const PANEL_VIEWPORT_MARGIN_PX = 12;

export const HEADER_SLOT_QUERY = `(min-width: ${PLAYER_CONTAINER_REM}rem)`;

export const LYRIC_SCROLL_SPRING = { type: "spring", stiffness: 110, damping: 24, mass: 0.7 } as const;

export const LYRIC_BLUR_DISTANCE = 2;

export const LYRIC_FAR_DISTANCE = 4;
