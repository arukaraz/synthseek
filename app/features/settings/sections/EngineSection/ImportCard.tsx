"use client";

import { useTranslation } from "react-i18next";

import { useUpdateEngineImport } from "@hooks/api/mutations/settings/useUpdateEngine";

import { EngineRow } from "../../components/EngineRow";
import { ResetDefaultsButton } from "../../components/ResetDefaultsButton";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { ENGINE_DEFAULTS } from "./defaults";
import type { ImportCardProps } from "./types";

export function ImportCard({ initial }: ImportCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateEngineImport();
  const { draft, setField, setAll, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  return (
    <SettingsCard
      title={t("import.title")}
      trailing={
        <ResetDefaultsButton
          onReset={() =>
            setAll({ ...draft, metadataConfidenceThreshold: ENGINE_DEFAULTS.import.metadataConfidenceThreshold })
          }
          disabled={isSaving}
        />
      }
    >
      <EngineRow
        label={t("import.metadataConfidence.label")}
        description={t("import.metadataConfidence.description")}
        control={
          <SettingsNumberInput
            value={draft.metadataConfidenceThreshold}
            onChange={(v) => setField("metadataConfidenceThreshold", v)}
            min={0}
            max={100}
            ariaLabel={t("import.metadataConfidence.ariaLabel")}
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
