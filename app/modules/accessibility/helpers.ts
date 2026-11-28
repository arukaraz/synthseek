import {
  ACCESSIBILITY_ATTRIBUTES,
  ACCESSIBILITY_COOKIE_FIELDS,
  ACCESSIBILITY_COOKIE_SEPARATOR,
  ATTRIBUTE_OFF,
  ATTRIBUTE_ON,
  DEFAULT_ACCESSIBILITY_COOKIE,
  DEFAULT_TEXT_SIZE,
  MOTION_CONFIG_BY_CHOICE,
  PREFERENCE_CODES,
  SWITCH_CODES,
  TEXT_SIZE_ATTRIBUTE,
  TEXT_SIZES,
} from "./constants";
import type {
  A11yPreference,
  AccessibilityAttributes,
  AccessibilityCookie,
  MotionConfigChoice,
  ShortcutKeyEvent,
  TextSize,
  TextSizeAttributes,
} from "./types";

const PREFERENCES: readonly A11yPreference[] = ["auto", "on", "off"];

function switchOf(code: string): boolean | null {
  if (code === SWITCH_CODES.on) return true;
  if (code === SWITCH_CODES.off) return false;
  return null;
}

function preferenceOf(code: string): A11yPreference | null {
  return PREFERENCES.find((preference) => PREFERENCE_CODES[preference] === code) ?? null;
}

function switchCode(on: boolean): string {
  return on ? SWITCH_CODES.on : SWITCH_CODES.off;
}

export function parseAccessibilityCookie(value: string | null | undefined): AccessibilityCookie {
  if (value === undefined || value === null) return DEFAULT_ACCESSIBILITY_COOKIE;
  const parts = value.split(ACCESSIBILITY_COOKIE_SEPARATOR);
  if (parts.length !== ACCESSIBILITY_COOKIE_FIELDS) return DEFAULT_ACCESSIBILITY_COOKIE;
  const [rawMode, rawMotion, rawTransparency, rawContrast, rawButtonNames] = parts;
  const mode = switchOf(rawMode);
  const motion = preferenceOf(rawMotion);
  const transparency = preferenceOf(rawTransparency);
  const contrast = preferenceOf(rawContrast);
  const buttonNames = switchOf(rawButtonNames);
  if (mode === null || motion === null || transparency === null || contrast === null || buttonNames === null) {
    return DEFAULT_ACCESSIBILITY_COOKIE;
  }
  return { mode, motion, transparency, contrast, buttonNames };
}

export function serializeAccessibilityCookie(values: AccessibilityCookie): string {
  return [
    switchCode(values.mode),
    PREFERENCE_CODES[values.motion],
    PREFERENCE_CODES[values.transparency],
    PREFERENCE_CODES[values.contrast],
    switchCode(values.buttonNames),
  ].join(ACCESSIBILITY_COOKIE_SEPARATOR);
}

export function sameAccessibilityCookie(left: AccessibilityCookie, right: AccessibilityCookie): boolean {
  return (
    left.mode === right.mode &&
    left.motion === right.motion &&
    left.transparency === right.transparency &&
    left.contrast === right.contrast &&
    left.buttonNames === right.buttonNames
  );
}

export function accessibilityAttributesOf(values: AccessibilityCookie): AccessibilityAttributes {
  const attributes: AccessibilityAttributes = {};
  if (values.mode) attributes[ACCESSIBILITY_ATTRIBUTES.mode] = ATTRIBUTE_ON;
  if (values.motion !== "auto") attributes[ACCESSIBILITY_ATTRIBUTES.motion] = values.motion;
  if (values.transparency !== "auto") attributes[ACCESSIBILITY_ATTRIBUTES.transparency] = values.transparency;
  if (values.contrast !== "auto") attributes[ACCESSIBILITY_ATTRIBUTES.contrast] = values.contrast;
  if (values.buttonNames) attributes[ACCESSIBILITY_ATTRIBUTES.buttonNames] = ATTRIBUTE_ON;
  return attributes;
}

export function parseTextSize(value: string | null | undefined): TextSize {
  return TEXT_SIZES.find((size) => size === value) ?? DEFAULT_TEXT_SIZE;
}

export function textSizeAttributesOf(size: TextSize): TextSizeAttributes {
  return size === DEFAULT_TEXT_SIZE ? {} : { [TEXT_SIZE_ATTRIBUTE]: size };
}

export function preferenceOfAttribute(value: string | null): A11yPreference {
  if (value === ATTRIBUTE_ON) return "on";
  if (value === ATTRIBUTE_OFF) return "off";
  return "auto";
}

export function resolveMotionReduced(choice: A11yPreference, deviceAsks: boolean): boolean {
  if (choice === "on") return true;
  if (choice === "off") return false;
  return deviceAsks;
}

export function resolveTransparencyReduced(choice: A11yPreference, motionReduced: boolean): boolean {
  if (choice === "on") return true;
  if (choice === "off") return false;
  return motionReduced;
}

export function resolveMoreContrast(choice: A11yPreference, mode: boolean, deviceAsks: boolean): boolean {
  if (mode) return true;
  if (choice === "on") return true;
  if (choice === "off") return false;
  return deviceAsks;
}

export function motionConfigOf(choice: A11yPreference): MotionConfigChoice {
  return MOTION_CONFIG_BY_CHOICE[choice];
}

export function isSingleCharacterShortcut(event: ShortcutKeyEvent): boolean {
  return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
}

export function shortcutAllowed(event: ShortcutKeyEvent, singleKeyShortcuts: boolean): boolean {
  return singleKeyShortcuts || !isSingleCharacterShortcut(event);
}
