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
    banAfterFailedAttempts: number;
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
        description="How long slskd keeps each search request open on the Soulseek network before stopping collection of new results."
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
        description="How many slskd uploaders to try downloading from per track before marking it failed."
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
        description="How many query-string combinations (artist+title, with/without album, with/without featuring) to try per track."
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
        description="Hourly cron deletes old slskd searches so its search list does not grow unbounded."
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
        description="How many of the most recent searches to retain in slskd. Older ones are removed by the cleanup job above."
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
      <EngineRow
        label="Auto-ban after N failures"
        description="Add an uploader to the banlist after this many download failures (counted in-memory, resets on restart). 0 disables."
        control={
          <SettingsNumberInput
            value={draft.banAfterFailedAttempts}
            onChange={(v) => setField("banAfterFailedAttempts", v)}
            min={0}
            max={20}
            ariaLabel="Auto-ban after N failed attempts"
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
