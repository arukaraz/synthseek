"use client";

import { useTranslation } from "react-i18next";
import { DestinationNote } from "./DestinationNote";
import { chosenDestinationId, destinationLabel, destinationOptions } from "./helpers";
import { LidarrSelect } from "./LidarrSelect";
import type { DestinationFieldProps } from "./types";

export function DestinationField({ preview, value, onChange, refreshing }: DestinationFieldProps) {
  const { t } = useTranslation("search");

  return (
    <>
      <LidarrSelect
        label={t("config.fields.destination")}
        placeholder={destinationLabel(preview)}
        options={destinationOptions(preview)}
        value={chosenDestinationId(preview, value)}
        onChange={(next) => onChange(next === preview.pathId ? null : next)}
        disabled={preview.lock !== null || refreshing}
      />
      <DestinationNote preview={preview} />
    </>
  );
}
