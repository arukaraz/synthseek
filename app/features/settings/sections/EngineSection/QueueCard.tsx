"use client";

import { useUpdateEngineQueue } from "@hooks/api/mutations/settings/useUpdateEngine";

import { EngineRow } from "../../components/EngineRow";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";

interface QueueCardProps {
  initial: { maxSize: number; maxConcurrentSearches: number; maxPendingImports: number };
}

export function QueueCard({ initial }: QueueCardProps) {
  const update = useUpdateEngineQueue();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  return (
    <SettingsCard title="Queue & concurrency">
      <EngineRow
        label="Max size"
        description="Hard cap on the total number of pending requests in the queue."
        control={
          <SettingsNumberInput
            value={draft.maxSize}
            onChange={(v) => setField("maxSize", v)}
            min={10}
            max={10000}
            ariaLabel="Max queue size"
          />
        }
      />
      <EngineRow
        label="Max concurrent searches"
        description="How many search jobs can run in parallel."
        control={
          <SettingsNumberInput
            value={draft.maxConcurrentSearches}
            onChange={(v) => setField("maxConcurrentSearches", v)}
            min={1}
            max={10}
            ariaLabel="Max concurrent searches"
          />
        }
      />
      <EngineRow
        label="Max pending imports"
        description="Tracks waiting for metadata extraction and library import."
        control={
          <SettingsNumberInput
            value={draft.maxPendingImports}
            onChange={(v) => setField("maxPendingImports", v)}
            min={1}
            max={20}
            ariaLabel="Max pending imports"
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
