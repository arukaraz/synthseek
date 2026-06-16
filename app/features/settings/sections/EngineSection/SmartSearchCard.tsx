"use client";

import { useTranslation } from "react-i18next";

import { useUpdateEngineSmartSearch } from "@hooks/api/mutations/settings/useUpdateEngine";

import { ChipsInput } from "../../components/ChipsInput";
import { ResetDefaultsButton } from "../../components/ResetDefaultsButton";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { ENGINE_DEFAULTS } from "./defaults";
import type { SmartSearchCardProps } from "./types";

export function SmartSearchCard({ initial }: SmartSearchCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateEngineSmartSearch();
  const { draft, setField, setAll, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  return (
    <SettingsCard
      title={t("search.smartSearchHeader")}
      trailing={<ResetDefaultsButton onReset={() => setAll({ ...ENGINE_DEFAULTS.smartSearch })} disabled={isSaving} />}
    >
      <SettingsField label={t("search.customMoodKeywords.label")} helper={t("search.customMoodKeywords.helper")}>
        <ChipsInput
          value={draft.customMoodKeywords}
          onChange={(v) => setField("customMoodKeywords", v)}
          placeholder={t("search.customMoodKeywords.placeholder")}
        />
      </SettingsField>

      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={() => save((payload) => update.mutateAsync(payload))}
        onCancel={reset}
      />
    </SettingsCard>
  );
}
