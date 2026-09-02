"use client";

import { useTranslation } from "react-i18next";

import { Switch } from "@components/ui/Switch";

import { useUpdateEngineQuality } from "@hooks/api/mutations/settings/useUpdateEngine";

import { EngineRow } from "../../components/EngineRow";
import { ResetDefaultsButton } from "../../components/ResetDefaultsButton";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { ENGINE_DEFAULTS } from "./defaults";
import type { QualityCardProps } from "./types";

export function QualityCard({ initial }: QualityCardProps) {
  const { t } = useTranslation("settings");
  const updateQuality = useUpdateEngineQuality();
  const qualityForm = useSettingsForm(initial);

  if (!qualityForm.draft) return null;

  return (
    <SettingsCard
      title={t("quality.title")}
      description={t("quality.description")}
      trailing={
        <ResetDefaultsButton
          onReset={() => qualityForm.setAll({ ...ENGINE_DEFAULTS.quality })}
          disabled={qualityForm.isSaving}
        />
      }
    >
      <EngineRow
        label={t("quality.upgradeEnabled.label")}
        description={t("quality.upgradeEnabled.description")}
        control={
          <Switch
            checked={qualityForm.draft.upgradeEnabled}
            onCheckedChange={(v) => qualityForm.setField("upgradeEnabled", v)}
            aria-label={t("quality.upgradeEnabled.label")}
          />
        }
      />
      <SaveBar
        isDirty={qualityForm.isDirty}
        isSaving={qualityForm.isSaving}
        onSave={() => qualityForm.save((payload) => updateQuality.mutateAsync(payload))}
        onCancel={qualityForm.reset}
      />
    </SettingsCard>
  );
}
