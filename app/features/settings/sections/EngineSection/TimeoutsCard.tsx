"use client";

import { useTranslation } from "react-i18next";

import { useUpdateEngineTimeouts } from "@hooks/api/mutations/settings/useUpdateEngine";

import { EngineRow } from "../../components/EngineRow";
import { ResetDefaultsButton } from "../../components/ResetDefaultsButton";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { ENGINE_DEFAULTS } from "./defaults";
import { MS } from "./constants";
import type { TimeoutsCardProps } from "./types";

export function TimeoutsCard({ initial }: TimeoutsCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateEngineTimeouts();
  const { draft, setField, setAll, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  const handleReset = () => {
    setAll({
      ...draft,
      downloadPhase: ENGINE_DEFAULTS.timeouts.downloadPhase,
      importPhase: ENGINE_DEFAULTS.timeouts.importPhase,
    });
  };

  return (
    <SettingsCard
      title={t("timeouts.title")}
      trailing={<ResetDefaultsButton onReset={handleReset} disabled={isSaving} />}
    >
      <EngineRow
        label={t("timeouts.downloadPhase.label")}
        description={t("timeouts.downloadPhase.description")}
        control={
          <SettingsNumberInput
            value={Math.round(draft.downloadPhase / MS)}
            onChange={(v) => setField("downloadPhase", v * MS)}
            min={60}
            max={3600}
            suffix="s"
            ariaLabel={t("timeouts.downloadPhase.ariaLabel")}
          />
        }
      />
      <EngineRow
        label={t("timeouts.importPhase.label")}
        description={t("timeouts.importPhase.description")}
        control={
          <SettingsNumberInput
            value={Math.round(draft.importPhase / MS)}
            onChange={(v) => setField("importPhase", v * MS)}
            min={30}
            max={3600}
            suffix="s"
            ariaLabel={t("timeouts.importPhase.ariaLabel")}
          />
        }
      />
      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={() => save((payload) => update.mutateAsync(payload))}
        onCancel={reset}
      />
    </SettingsCard>
  );
}
