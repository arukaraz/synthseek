"use client";

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
  const update = useUpdateEngineImport();
  const { draft, setField, setAll, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  return (
    <SettingsCard
      title="Import"
      trailing={<ResetDefaultsButton onReset={() => setAll({ ...ENGINE_DEFAULTS.import })} disabled={isSaving} />}
    >
      <EngineRow
        label="Metadata confidence threshold"
        description="Minimum match (0-100) between a downloaded file's embedded audio tags. Files below this score are rejected with and can be retried."
        control={
          <SettingsNumberInput
            value={draft.metadataConfidenceThreshold}
            onChange={(v) => setField("metadataConfidenceThreshold", v)}
            min={0}
            max={100}
            ariaLabel="Metadata confidence threshold"
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
