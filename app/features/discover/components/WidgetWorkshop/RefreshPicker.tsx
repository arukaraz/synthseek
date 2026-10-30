"use client";

import { useTranslation } from "react-i18next";

import { SegmentedControl } from "@components/ui/SegmentedControl";

import { SMART_REFRESHES } from "./constants";
import type { RefreshPickerProps } from "./types";

export function RefreshPicker({ value, onChange }: RefreshPickerProps) {
  const { t } = useTranslation("widgets");

  return (
    <SegmentedControl
      ariaLabel={t("playlist.refresh")}
      value={value}
      options={SMART_REFRESHES.map((refresh) => ({ value: refresh, label: t(`playlist.refreshes.${refresh}`) }))}
      onChange={onChange}
    />
  );
}
