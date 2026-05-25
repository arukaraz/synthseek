"use client";

import { useUpdateEngineSearch } from "@hooks/api/mutations/settings/useUpdateEngine";

import { EngineRow } from "../../components/EngineRow";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { Switch } from "@components/ui/Switch";
import { useSettingsForm } from "../../hooks/useSettingsForm";

interface SearchCardProps {
  initial: {
    timeout: number;
    maxPeerAttempts: number;
    maxVariations: number;
    historyCleanupEnabled: boolean;
    maxHistorySearches: number;
  };
}

export function SearchCard({ initial }: SearchCardProps) {
  const update = useUpdateEngineSearch();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  const timeoutSeconds = Math.round(draft.timeout / 1000);

  return (
    <SettingsCard title="Search">
      <EngineRow
        label="Timeout"
        description="Give up on a search after this many seconds with no results."
        control={
          <SettingsNumberInput
            value={timeoutSeconds}
            onChange={(v) => setField("timeout", v * 1000)}
            min={5}
            max={60}
            suffix="s"
            ariaLabel="Search timeout"
          />
        }
      />
      <EngineRow
        label="Max peer attempts"
        description="How many sources to try before marking a track as failed."
        control={
          <SettingsNumberInput
            value={draft.maxPeerAttempts}
            onChange={(v) => setField("maxPeerAttempts", v)}
            min={1}
            max={50}
            ariaLabel="Max peer attempts"
          />
        }
      />
      <EngineRow
        label="Max variations"
        description="Title variations to try (acoustic, remix, etc.) per query."
        control={
          <SettingsNumberInput
            value={draft.maxVariations}
            onChange={(v) => setField("maxVariations", v)}
            min={1}
            max={20}
            ariaLabel="Max variations"
          />
        }
      />
      <EngineRow
        label="History cleanup enabled"
        description="Periodically prune stale search history."
        control={
          <Switch
            checked={draft.historyCleanupEnabled}
            onCheckedChange={(v) => setField("historyCleanupEnabled", v)}
            aria-label="History cleanup enabled"
          />
        }
      />
      <EngineRow
        label="Max history searches"
        description="Cap on stored past searches before older ones are deleted."
        control={
          <SettingsNumberInput
            value={draft.maxHistorySearches}
            onChange={(v) => setField("maxHistorySearches", v)}
            min={5}
            max={100}
            ariaLabel="Max history searches"
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
