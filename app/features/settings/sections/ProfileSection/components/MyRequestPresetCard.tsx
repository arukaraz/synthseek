"use client";

import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

import { summarizePreset } from "@features/search/components/ConfigRequestModal/helpers";
import { useMyRequestPreset, useSetMyRequestPreset } from "@hooks/api";

import { presetLocked, presetLockedIcon, RequestPresetCard } from "../../../components/RequestPreset";
import { SettingsCard } from "../../../components/SettingsCard";
import { lockedPresetKey } from "../helpers";

export function MyRequestPresetCard() {
  const { t } = useTranslation("settings");
  const { t: tSearch } = useTranslation("search");
  const { data, isError } = useMyRequestPreset();
  const save = useSetMyRequestPreset();

  if (isError) {
    return (
      <SettingsCard title={t("requestPreset.own.title")} anchor="requestPreset">
        <p className={presetLocked()} data-cy="request-preset-unavailable">
          {t("requestPreset.unavailable")}
        </p>
      </SettingsCard>
    );
  }

  if (!data) return null;

  if (!data.canEdit) {
    return (
      <SettingsCard title={t("requestPreset.own.title")} anchor="requestPreset">
        <p className={presetLocked()} data-cy="request-preset-locked">
          <Lock className={presetLockedIcon()} aria-hidden />
          <span>
            {t(lockedPresetKey(data.effective.origin), { summary: summarizePreset(data.effective.preset, tSearch) })}
          </span>
        </p>
      </SettingsCard>
    );
  }

  return (
    <RequestPresetCard
      title={t("requestPreset.own.title")}
      description={t("requestPreset.own.description")}
      anchor="requestPreset"
      own={data.own}
      seed={data.server ?? data.factory}
      followLabel={t("requestPreset.own.followLabel")}
      customLabel={t("requestPreset.own.customLabel")}
      followSummary={
        data.server
          ? t("requestPreset.own.followServer", { summary: summarizePreset(data.server, tSearch) })
          : t("requestPreset.own.followDefault", { summary: summarizePreset(data.factory, tSearch) })
      }
      onSave={(preset) => save.mutateAsync({ preset })}
    />
  );
}
