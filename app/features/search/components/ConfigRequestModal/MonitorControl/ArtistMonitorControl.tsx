"use client";

import { useTranslation } from "react-i18next";
import { ARTIST_MONITOR_SCOPE_OPTIONS } from "../constants";
import type { Option } from "../types";
import { ScopeRadioList } from "./ScopeRadioList";
import type { ArtistMonitorControlProps } from "./types";

export function ArtistMonitorControl({ label, value, onChange }: ArtistMonitorControlProps) {
  const { t } = useTranslation("search");

  const scopeOptions: Option<ArtistMonitorControlProps["value"]>[] = ARTIST_MONITOR_SCOPE_OPTIONS.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
    description: t(option.descriptionKey),
  }));

  return <ScopeRadioList label={label} options={scopeOptions} value={value} onChange={onChange} />;
}
