export const INFINITE_SCROLL_ROOT_MARGIN = "200px";

export const DRAFT_DEBOUNCE_MS = 300;

export const RENDER_WINDOW_STEP = 40;

export const CLIENT_PAGINATION = {
  THRESHOLD: 15,
  PAGE_SIZE: 10,
  SIZE_OPTIONS: [10, 25, 50] as const,
} as const;

export const SCROLL_EDGE_TOLERANCE_PX = 4;

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const PHONE_QUERY = "(max-width: 639px)";

export const LONG_PRESS_MS = 450;

export const LONG_PRESS_SLOP_PX = 10;

export const LONG_PRESS_CLICK_GRACE_MS = 350;

export const LONG_PRESS_IGNORED_SELECTOR = "button, a, input, select, textarea, [role=menuitem]";

export const SHEET_DRAG = {
  AXIS_LOCK_PX: 6,
  DISMISS_DISTANCE_PX: 120,
  DISMISS_FRACTION: 0.25,
  DISMISS_VELOCITY_PX_PER_MS: 0.5,
  SETTLE_MS: 220,
} as const;
