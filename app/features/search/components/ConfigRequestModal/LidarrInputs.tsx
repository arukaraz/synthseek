"use client";

import { useLidarrProfiles } from "@hooks/api";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LidarrSelect } from "./LidarrSelect";
import { OptionGrid } from "./OptionGrid";
import {
  buildMetadataProfileOptions,
  buildQualityProfileOptions,
  buildRootFolderOptions,
  isLidarrSelectionComplete,
} from "./helpers";
import type { LidarrInputsProps, Option } from "./types";

export function LidarrInputs<M extends string>({ value, onChange, monitorOptions }: LidarrInputsProps<M>) {
  const { t } = useTranslation("search");
  const { data, isLoading, isError } = useLidarrProfiles({ enabled: true });

  useEffect(() => {
    if (!data) return;
    if (isLidarrSelectionComplete(value)) return;
    onChange({
      rootFolderPath: value.rootFolderPath ?? data.defaults.rootFolderPath,
      qualityProfileId: value.qualityProfileId ?? data.defaults.qualityProfileId,
      metadataProfileId: value.metadataProfileId ?? data.defaults.metadataProfileId,
      monitor: value.monitor,
    });
  }, [data, value, onChange]);

  const monitorGridOptions: Option<M>[] = monitorOptions.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
    description: t(option.descriptionKey),
  }));

  if (isLoading) {
    return (
      <div className="text-fg/60 flex items-center gap-2 text-sm" role="status" aria-live="polite">
        <Loader2 className="size-4 animate-spin" />
        {t("config.lidarr.loading")}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-destructive-vivid flex items-center gap-2 text-sm" role="alert">
        <AlertCircle className="size-4 shrink-0" />
        {t("config.lidarr.error")}
      </div>
    );
  }

  const rootFolderOptions = buildRootFolderOptions(data.rootFolders, t("config.lidarr.freeSuffix"));
  const qualityOptions = buildQualityProfileOptions(data.qualityProfiles);
  const metadataOptions = buildMetadataProfileOptions(data.metadataProfiles);

  return (
    <div className="space-y-3 sm:space-y-4">
      <LidarrSelect
        label={t("config.fields.lidarrRootFolder")}
        placeholder={t("config.lidarr.placeholders.rootFolder")}
        options={rootFolderOptions}
        value={value.rootFolderPath}
        onChange={(rootFolderPath) => onChange({ ...value, rootFolderPath })}
      />
      <LidarrSelect
        label={t("config.fields.lidarrQualityProfile")}
        placeholder={t("config.lidarr.placeholders.qualityProfile")}
        options={qualityOptions}
        value={value.qualityProfileId}
        onChange={(qualityProfileId) => onChange({ ...value, qualityProfileId })}
      />
      <LidarrSelect
        label={t("config.fields.lidarrMetadataProfile")}
        placeholder={t("config.lidarr.placeholders.metadataProfile")}
        options={metadataOptions}
        value={value.metadataProfileId}
        onChange={(metadataProfileId) => onChange({ ...value, metadataProfileId })}
      />
      <OptionGrid
        label={t("config.fields.lidarrMonitor")}
        options={monitorGridOptions}
        value={value.monitor}
        onChange={(monitor) => onChange({ ...value, monitor })}
        columns={2}
        showCheckmark
      />
    </div>
  );
}
