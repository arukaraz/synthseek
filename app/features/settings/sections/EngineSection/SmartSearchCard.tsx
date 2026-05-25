"use client";

import { Switch } from "@components/ui/Switch";
import { useUpdateEngineSmartSearch } from "@hooks/api/mutations/settings/useUpdateEngine";

import { ChipsInput } from "../../components/ChipsInput";
import { EngineRow } from "../../components/EngineRow";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { useSettingsForm } from "../../hooks/useSettingsForm";

interface SmartSearchCardProps {
  initial: { customMoodKeywords: string[]; communityPatternsEnabled: boolean };
}

export function SmartSearchCard({ initial }: SmartSearchCardProps) {
  const update = useUpdateEngineSmartSearch();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  return (
    <SettingsCard title="Smart search">
      <EngineRow
        label="Community patterns"
        description="Opt in: a daily cron shares your anonymized mood/genre keywords with the Synthseek API and pulls back community-contributed ones to improve smart-search classification."
        control={
          <Switch
            checked={draft.communityPatternsEnabled}
            onCheckedChange={(v) => setField("communityPatternsEnabled", v)}
            aria-label="Community patterns"
          />
        }
      />
      <SettingsField
        label="Custom mood keywords"
        helper="Substrings tested against user search queries to classify them as mood/genre searches (vs specific artist/track). Press Enter or comma to add."
      >
        <ChipsInput
          value={draft.customMoodKeywords}
          onChange={(v) => setField("customMoodKeywords", v)}
          placeholder="e.g. block party, my favorites"
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
