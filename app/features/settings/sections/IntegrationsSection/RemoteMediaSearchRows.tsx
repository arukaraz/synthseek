"use client";

import { useTranslation } from "react-i18next";

import { EngineRow } from "../../components/EngineRow";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { MS } from "./constants";
import type { RemoteMediaSearchRowsProps } from "./types";

export function RemoteMediaSearchRows({ section, values, onFieldChange }: RemoteMediaSearchRowsProps) {
  const { t } = useTranslation("settings");

  return (
    <>
      <EngineRow
        label={t(`${section}.searchResults.label`)}
        description={t(`${section}.searchResults.description`)}
        control={
          <SettingsNumberInput
            value={values.searchResults}
            onChange={(v) => onFieldChange("searchResults", v)}
            min={1}
            max={20}
            ariaLabel={t(`${section}.searchResults.ariaLabel`)}
          />
        }
      />

      <EngineRow
        label={t(`${section}.maxDurationDelta.label`)}
        description={t(`${section}.maxDurationDelta.description`)}
        control={
          <SettingsNumberInput
            value={values.maxDurationDeltaSec}
            onChange={(v) => onFieldChange("maxDurationDeltaSec", v)}
            min={0}
            max={120}
            suffix="s"
            ariaLabel={t(`${section}.maxDurationDelta.ariaLabel`)}
          />
        }
      />

      <EngineRow
        label={t(`${section}.searchTimeout.label`)}
        description={t(`${section}.searchTimeout.description`)}
        control={
          <SettingsNumberInput
            value={Math.round(values.searchTimeout / MS)}
            onChange={(v) => onFieldChange("searchTimeout", v * MS)}
            min={5}
            max={120}
            suffix="s"
            ariaLabel={t(`${section}.searchTimeout.ariaLabel`)}
          />
        }
      />
    </>
  );
}
