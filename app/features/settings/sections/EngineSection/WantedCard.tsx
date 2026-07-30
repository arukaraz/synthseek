"use client";

import { useTranslation } from "react-i18next";

import { Switch } from "@components/ui/Switch";

import { useUpdateEngineWanted } from "@hooks/api/mutations/settings/useUpdateEngine";

import { EngineRow } from "../../components/EngineRow";
import { ResetDefaultsButton } from "../../components/ResetDefaultsButton";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { ENGINE_DEFAULTS } from "./defaults";
import type { WantedCardProps } from "./types";

export function WantedCard({ initial }: WantedCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateEngineWanted();
  const { draft, setField, setAll, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  return (
    <SettingsCard
      title={t("wanted.title")}
      description={t("wanted.description")}
      trailing={<ResetDefaultsButton onReset={() => setAll({ ...ENGINE_DEFAULTS.wanted })} disabled={isSaving} />}
    >
      <EngineRow
        label={t("wanted.enabled.label")}
        description={t("wanted.enabled.description")}
        control={
          <Switch
            checked={draft.enabled}
            onCheckedChange={(v) => setField("enabled", v)}
            aria-label={t("wanted.enabled.label")}
          />
        }
      />
      <EngineRow
        label={t("wanted.perRunCap.label")}
        description={t("wanted.perRunCap.description")}
        control={
          <SettingsNumberInput
            value={draft.perRunCap}
            onChange={(v) => setField("perRunCap", v)}
            min={1}
            max={50}
            ariaLabel={t("wanted.perRunCap.ariaLabel")}
          />
        }
      />
      <EngineRow
        label={t("wanted.maxAttempts.label")}
        description={t("wanted.maxAttempts.description")}
        control={
          <SettingsNumberInput
            value={draft.maxAttempts}
            onChange={(v) => setField("maxAttempts", v)}
            min={1}
            max={20}
            ariaLabel={t("wanted.maxAttempts.ariaLabel")}
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
