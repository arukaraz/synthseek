"use client";

import { useLidarrProfiles, useLidarrTags } from "@hooks/api";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LidarrSelect } from "./LidarrSelect";
import { LidarrTagsInput } from "./LidarrTagsInput";
import {
  buildMetadataProfileOptions,
  buildQualityProfileOptions,
  buildRootFolderOptions,
  isLidarrSelectionComplete,
} from "./helpers";
import type { LidarrProfileFieldsProps } from "./types";

export function LidarrProfileFields<M extends string>({ value, onChange, monitorSlot }: LidarrProfileFieldsProps<M>) {
  const { t } = useTranslation("search");
  const { data, isLoading, isError } = useLidarrProfiles({ enabled: true });
  const { data: tagsData } = useLidarrTags({ enabled: true });
  const tagSuggestions = useMemo(() => (tagsData ?? []).map((tag) => tag.label), [tagsData]);

  useEffect(() => {
    if (!data) return;
    if (isLidarrSelectionComplete(value)) return;
    onChange({
      rootFolderPath: value.rootFolderPath ?? data.defaults.rootFolderPath,
      qualityProfileId: value.qualityProfileId ?? data.defaults.qualityProfileId,
      metadataProfileId: value.metadataProfileId ?? data.defaults.metadataProfileId,
      monitor: value.monitor,
      tags: value.tags,
    });
  }, [data, value, onChange]);

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
      {monitorSlot}
      <LidarrTagsInput
        label={t("config.fields.lidarrTags")}
        value={value.tags}
        onChange={(tags) => onChange({ ...value, tags })}
        suggestions={tagSuggestions}
      />
    </div>
  );
}
