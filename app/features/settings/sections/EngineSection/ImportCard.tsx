"use client";

import { useUpdateEngineImport } from "@hooks/api/mutations/settings/useUpdateEngine";

import { EngineRow } from "../../components/EngineRow";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";

interface ImportCardProps {
  initial: { metadataConfidenceThreshold: number };
}

export function ImportCard({ initial }: ImportCardProps) {
  const update = useUpdateEngineImport();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  return (
    <SettingsCard title="Import">
      <EngineRow
        label="Metadata confidence threshold"
        description="Minimum match score for downloaded files to be auto-imported."
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
