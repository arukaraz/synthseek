"use client";

import { useUpdateEngineQueue } from "@hooks/api/mutations/settings/useUpdateEngine";

import { EngineRow } from "../../components/EngineRow";
import { ResetDefaultsButton } from "../../components/ResetDefaultsButton";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { ENGINE_DEFAULTS } from "./defaults";

interface QueueCardProps {
  initial: { maxSize: number; maxConcurrentSearches: number; maxPendingImports: number };
}

export function QueueCard({ initial }: QueueCardProps) {
  const update = useUpdateEngineQueue();
  const { draft, setField, setAll, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  return (
    <SettingsCard
      title="Queue & concurrency"
      trailing={<ResetDefaultsButton onReset={() => setAll({ ...ENGINE_DEFAULTS.queue })} disabled={isSaving} />}
    >
      <EngineRow
        label="Max size"
        description="Hard cap on total jobs the queue holds at once (queued + active). New requests are rejected when full."
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
        description="How many tracks can be in the search phase simultaneously."
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
        description="Backpressure: when this many downloaded tracks are waiting to import, the engine pauses starting new searches until imports drain."
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
