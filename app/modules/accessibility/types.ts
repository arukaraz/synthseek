import type { A11yPreference, A11yToastDuration, PublicUser } from "@api/__generated__/types";

export type { A11yPreference, A11yToastDuration };

export type AccessibilitySettings = PublicUser["accessibility"];

export type AccessibilityCookie = Pick<
  AccessibilitySettings,
  "mode" | "motion" | "transparency" | "contrast" | "buttonNames"
>;

export type AccessibilityAttribute =
  | "data-a11y-mode"
  | "data-a11y-motion"
  | "data-a11y-transparency"
  | "data-a11y-contrast"
  | "data-a11y-names";

export type AccessibilityAttributes = Partial<Record<AccessibilityAttribute, string>>;

export type TextSize = "normal" | "large" | "larger" | "largest";

export type TextSizeAttribute = "data-a11y-text";

export type TextSizeAttributes = Partial<Record<TextSizeAttribute, string>>;

export type MotionConfigChoice = "user" | "always" | "never";

export interface ShortcutKeyEvent {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

export interface ResolvedAccessibility {
  motionReduced: boolean;
  transparencyReduced: boolean;
  moreContrast: boolean;
}
