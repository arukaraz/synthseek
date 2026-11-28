import type { ParseKeys } from "i18next";
import type { ReactNode } from "react";

import type { AccessibilitySettings } from "@modules/accessibility";

export type AccessibilityControlsScope = "account" | "guest";

export interface AccessibilityControlsProps {
  scope: AccessibilityControlsScope;
}

export type PreferenceKey = "motion" | "transparency" | "contrast";

export interface ControlDefinition {
  anchor: string;
  labelKey: ParseKeys<"settings">;
  descriptionKey: ParseKeys<"settings">;
}

export interface PreferenceDefinition extends ControlDefinition {
  key: PreferenceKey;
}

export interface ControlRowProps {
  definition: ControlDefinition;
  descriptionId: string;
  children: ReactNode;
}

export type AccessibilityPatch = Partial<AccessibilitySettings>;
