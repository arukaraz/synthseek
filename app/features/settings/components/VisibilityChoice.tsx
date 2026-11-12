"use client";

import { useTranslation } from "react-i18next";

import { SegmentedControl } from "@components/ui/SegmentedControl";

import { VISIBILITY_KEYS, VISIBILITY_ORDER } from "./constants";
import type { VisibilityChoiceProps } from "./types";

export function VisibilityChoice({ value, disabled, ariaLabel, onChange }: VisibilityChoiceProps) {
  const { t } = useTranslation("settings");

  return (
    <SegmentedControl
      value={value}
      options={VISIBILITY_ORDER.map((visibility) => ({ value: visibility, label: t(VISIBILITY_KEYS[visibility]) }))}
      onChange={onChange}
      disabled={disabled}
      ariaLabel={ariaLabel}
    />
  );
}
