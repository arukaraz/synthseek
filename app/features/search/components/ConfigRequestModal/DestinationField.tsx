"use client";

import { useLibraryDestination } from "@hooks/api";
import { useTranslation } from "react-i18next";
import { DestinationNote } from "./DestinationNote";
import { destinationLabel, destinationOptions } from "./helpers";
import { LidarrSelect } from "./LidarrSelect";
import type { DestinationFieldProps } from "./types";

export function DestinationField({ request, value, onChange }: DestinationFieldProps) {
  const { t } = useTranslation("search");
  const destination = useLibraryDestination(request, true);
  const preview = destination.data;

  if (preview === undefined || preview.paths.length < 2) return null;

  const locked = preview.lock !== null;

  return (
    <div className="space-y-3 sm:space-y-4" data-cy="request-destination">
      <h3 className="text-fg/90 text-xs font-semibold tracking-wide uppercase sm:text-sm">
        {t("config.sections.destination")}
      </h3>
      <LidarrSelect
        label={t("config.fields.destination")}
        placeholder={destinationLabel(preview)}
        options={destinationOptions(preview)}
        value={locked ? preview.pathId : (value ?? preview.pathId)}
        onChange={(next) => onChange(next === preview.pathId ? null : next)}
        disabled={locked}
      />
      <DestinationNote preview={preview} />
    </div>
  );
}
