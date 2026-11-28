import type { ParseKeys } from "i18next";

import type { A11yPreference, A11yToastDuration, TextSize } from "@modules/accessibility";

import type { ControlDefinition, PreferenceDefinition } from "./types";

export const MODE_CONTROL: ControlDefinition = {
  anchor: "accessibility.mode",
  labelKey: "accessibility.mode.label",
  descriptionKey: "accessibility.mode.description",
};

export const PREFERENCE_CONTROLS: readonly PreferenceDefinition[] = [
  {
    key: "motion",
    anchor: "accessibility.motion",
    labelKey: "accessibility.motion.label",
    descriptionKey: "accessibility.motion.description",
  },
  {
    key: "transparency",
    anchor: "accessibility.transparency",
    labelKey: "accessibility.transparency.label",
    descriptionKey: "accessibility.transparency.description",
  },
  {
    key: "contrast",
    anchor: "accessibility.contrast",
    labelKey: "accessibility.contrast.label",
    descriptionKey: "accessibility.contrast.description",
  },
];

export const TOAST_DURATION_CONTROL: ControlDefinition = {
  anchor: "accessibility.toastDuration",
  labelKey: "accessibility.toastDuration.label",
  descriptionKey: "accessibility.toastDuration.description",
};

export const SHORTCUTS_CONTROL: ControlDefinition = {
  anchor: "accessibility.shortcuts",
  labelKey: "accessibility.shortcuts.label",
  descriptionKey: "accessibility.shortcuts.description",
};

export const TEXT_SIZE_CONTROL: ControlDefinition = {
  anchor: "accessibility.textSize",
  labelKey: "accessibility.textSize.label",
  descriptionKey: "accessibility.textSize.description",
};

export const BUTTON_NAMES_CONTROL: ControlDefinition = {
  anchor: "accessibility.buttonNames",
  labelKey: "accessibility.buttonNames.label",
  descriptionKey: "accessibility.buttonNames.description",
};

export const MONO_AUDIO_CONTROL: ControlDefinition = {
  anchor: "accessibility.monoAudio",
  labelKey: "accessibility.monoAudio.label",
  descriptionKey: "accessibility.monoAudio.description",
};

export const REACTIVE_WAVE_CONTROL: ControlDefinition = {
  anchor: "accessibility.reactiveWave",
  labelKey: "accessibility.reactiveWave.label",
  descriptionKey: "accessibility.reactiveWave.description",
};

export const TEXT_SIZE_KEYS: Readonly<Record<TextSize, ParseKeys<"settings">>> = {
  normal: "accessibility.textSize.options.normal",
  large: "accessibility.textSize.options.large",
  larger: "accessibility.textSize.options.larger",
  largest: "accessibility.textSize.options.largest",
};

export const PREFERENCE_ORDER: readonly A11yPreference[] = ["auto", "on", "off"];

export const PREFERENCE_KEYS: Readonly<Record<A11yPreference, ParseKeys<"settings">>> = {
  auto: "accessibility.choices.auto",
  on: "accessibility.choices.on",
  off: "accessibility.choices.off",
};

export const TOAST_DURATION_ORDER: readonly A11yToastDuration[] = ["default", "2", "4", "8", "sticky"];

export const TOAST_DURATION_KEYS: Readonly<Record<A11yToastDuration, ParseKeys<"settings">>> = {
  default: "accessibility.toastDuration.options.default",
  "2": "accessibility.toastDuration.options.2",
  "4": "accessibility.toastDuration.options.4",
  "8": "accessibility.toastDuration.options.8",
  sticky: "accessibility.toastDuration.options.sticky",
};
