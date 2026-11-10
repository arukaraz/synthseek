"use client";

import { useTranslation } from "react-i18next";

import { summarizePreset } from "@features/search/components/ConfigRequestModal/helpers";
import { useMyRequestPreset, useSetServerRequestPreset } from "@hooks/api";

import { presetLocked, RequestPresetCard } from "../../components/RequestPreset";
import { SettingsCard } from "../../components/SettingsCard";

export function ServerRequestPresetCard() {
  const { t } = useTranslation("settings");
  const { t: tSearch } = useTranslation("search");
  const { data, isError } = useMyRequestPreset();
  const save = useSetServerRequestPreset();

  if (isError) {
    return (
      <SettingsCard title={t("requestPreset.server.title")} anchor="engine.requestPreset">
        <p className={presetLocked()} data-cy="request-preset-unavailable">
          {t("requestPreset.unavailable")}
        </p>
      </SettingsCard>
    );
  }

  if (!data) return null;

  return (
    <RequestPresetCard
      title={t("requestPreset.server.title")}
      description={t("requestPreset.server.description")}
      anchor="engine.requestPreset"
      own={data.server}
      seed={data.factory}
      followLabel={t("requestPreset.server.followLabel")}
      customLabel={t("requestPreset.server.customLabel")}
      followSummary={t("requestPreset.server.followSummary", { summary: summarizePreset(data.factory, tSearch) })}
      onSave={(preset) => save.mutateAsync({ preset })}
    />
  );
}
