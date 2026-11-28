import type {
  A11yPreference,
  AccessibilityAttribute,
  AccessibilityCookie,
  AccessibilitySettings,
  MotionConfigChoice,
  TextSize,
  TextSizeAttribute,
} from "./types";

export const TEXT_SIZE_COOKIE = "a11y_text";

export const TEXT_SIZE_ATTRIBUTE: TextSizeAttribute = "data-a11y-text";

export const TEXT_SIZES: readonly TextSize[] = ["normal", "large", "larger", "largest"];

export const DEFAULT_TEXT_SIZE: TextSize = "normal";

export const TEXT_SIZE_SCALES: Readonly<Record<TextSize, number>> = {
  normal: 1,
  large: 1.125,
  larger: 1.25,
  largest: 1.5,
};

export const ACCESSIBILITY_COOKIE = "a11y";

export const ACCESSIBILITY_GUEST_COOKIE = "a11y_guest";

export const ACCESSIBILITY_GUEST_MARKER = "1";

export const ACCESSIBILITY_COOKIE_SEPARATOR = ".";

export const ACCESSIBILITY_COOKIE_FIELDS = 5;

export const ACCESSIBILITY_COOKIE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

export const SWITCH_CODES = { on: "1", off: "0" } as const;

export const PREFERENCE_CODES: Readonly<Record<A11yPreference, string>> = { auto: "a", on: "1", off: "0" };

export const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  mode: false,
  motion: "auto",
  transparency: "auto",
  contrast: "auto",
  toastDuration: "default",
  singleKeyShortcuts: true,
  buttonNames: false,
  monoAudio: false,
  reactiveWave: true,
};

export const DEFAULT_ACCESSIBILITY_COOKIE: AccessibilityCookie = {
  mode: DEFAULT_ACCESSIBILITY.mode,
  motion: DEFAULT_ACCESSIBILITY.motion,
  transparency: DEFAULT_ACCESSIBILITY.transparency,
  contrast: DEFAULT_ACCESSIBILITY.contrast,
  buttonNames: DEFAULT_ACCESSIBILITY.buttonNames,
};

export const ACCESSIBILITY_ATTRIBUTES = {
  mode: "data-a11y-mode",
  motion: "data-a11y-motion",
  transparency: "data-a11y-transparency",
  contrast: "data-a11y-contrast",
  buttonNames: "data-a11y-names",
} as const satisfies Readonly<Record<keyof AccessibilityCookie, AccessibilityAttribute>>;

export const ACCESSIBILITY_ATTRIBUTE_NAMES: readonly AccessibilityAttribute[] = Object.values(ACCESSIBILITY_ATTRIBUTES);

export const ATTRIBUTE_ON = "on";

export const ATTRIBUTE_OFF = "off";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const MORE_CONTRAST_QUERY = "(prefers-contrast: more)";

export const MOTION_CONFIG_BY_CHOICE: Readonly<Record<A11yPreference, MotionConfigChoice>> = {
  auto: "user",
  on: "always",
  off: "never",
};
