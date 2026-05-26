"use client";

import { Switch } from "@components/ui/Switch";
import { useUpdateEngineSearch, useUpdateEngineSmartSearch } from "@hooks/api/mutations/settings/useUpdateEngine";

import { ChipsInput } from "../../components/ChipsInput";
import { EngineRow } from "../../components/EngineRow";
import { Pill } from "../../components/Pill";
import { ResetDefaultsButton } from "../../components/ResetDefaultsButton";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { cardDivider, cardSectionHeader } from "../../styles";
import { ENGINE_DEFAULTS } from "./defaults";

interface SearchCardProps {
  initial: {
    search: {
      maxPeerAttempts: number;
      maxVariations: number;
      historyCleanupEnabled: boolean;
      maxHistorySearches: number;
      banAfterFailedAttempts: number;
    };
    smartSearch: {
      customMoodKeywords: string[];
      communityPatternsEnabled: boolean;
    };
  };
}

export function SearchCard({ initial }: SearchCardProps) {
  const updateSearch = useUpdateEngineSearch();
  const updateSmartSearch = useUpdateEngineSmartSearch();
  const searchForm = useSettingsForm(initial.search);
  const smartForm = useSettingsForm(initial.smartSearch);

  if (!searchForm.draft || !smartForm.draft) return null;

  const isDirty = searchForm.isDirty || smartForm.isDirty;
  const isSaving = searchForm.isSaving || smartForm.isSaving;

  const handleSave = async () => {
    const promises: Promise<unknown>[] = [];
    if (searchForm.isDirty) promises.push(searchForm.save((p) => updateSearch.mutateAsync(p)));
    if (smartForm.isDirty) promises.push(smartForm.save((p) => updateSmartSearch.mutateAsync(p)));
    await Promise.all(promises);
  };

  const handleResetAll = () => {
    searchForm.setAll({ ...ENGINE_DEFAULTS.search });
    smartForm.setAll({ ...ENGINE_DEFAULTS.smartSearch });
  };

  const handleCancel = () => {
    searchForm.reset();
    smartForm.reset();
  };

  return (
    <SettingsCard title="Search" trailing={<ResetDefaultsButton onReset={handleResetAll} disabled={isSaving} />}>
      <EngineRow
        label="Max peer attempts"
        description="How many slskd uploaders to try downloading from per track before marking it failed."
        control={
          <SettingsNumberInput
            value={searchForm.draft.maxPeerAttempts}
            onChange={(v) => searchForm.setField("maxPeerAttempts", v)}
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
            value={searchForm.draft.maxVariations}
            onChange={(v) => searchForm.setField("maxVariations", v)}
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
            checked={searchForm.draft.historyCleanupEnabled}
            onCheckedChange={(v) => searchForm.setField("historyCleanupEnabled", v)}
            aria-label="History cleanup enabled"
          />
        }
      />
      <EngineRow
        label="Max history searches"
        description="How many of the most recent searches to retain in slskd. Older ones are removed by the cleanup job above."
        control={
          <SettingsNumberInput
            value={searchForm.draft.maxHistorySearches}
            onChange={(v) => searchForm.setField("maxHistorySearches", v)}
            min={5}
            max={100}
            ariaLabel="Max history searches"
          />
        }
      />

      <div className={cardDivider()} />
      <span className={cardSectionHeader()}>Smart search</span>

      <EngineRow
        label="Auto-ban after N failures"
        anchor="ban-threshold"
        description="Add an uploader/peer to the banlist after this many download failures (counted in-memory, resets on restart). 0 disables."
        control={
          <SettingsNumberInput
            value={searchForm.draft.banAfterFailedAttempts}
            onChange={(v) => searchForm.setField("banAfterFailedAttempts", v)}
            min={0}
            max={20}
            ariaLabel="Auto-ban after N failed attempts"
          />
        }
      />

      <SettingsField
        label="Custom mood keywords"
        helper="Substrings tested against user search queries to classify them as mood/genre searches (vs specific artist/track). Press Enter or comma to add."
      >
        <ChipsInput
          value={smartForm.draft.customMoodKeywords}
          onChange={(v) => smartForm.setField("customMoodKeywords", v)}
          placeholder="e.g. block party, my favorites"
        />
      </SettingsField>

      <EngineRow
        label="Community patterns"
        labelTrailing={<Pill tone="experimental">Experimental</Pill>}
        description="Opt in: a daily cron shares your anonymized mood/genre keywords with the Synthseek API and pulls back community-contributed ones to improve smart-search classification."
        control={
          <Switch
            checked={smartForm.draft.communityPatternsEnabled}
            onCheckedChange={(v) => smartForm.setField("communityPatternsEnabled", v)}
            aria-label="Community patterns"
          />
        }
      />

      <SaveBar isDirty={isDirty} isSaving={isSaving} onSave={handleSave} onCancel={handleCancel} />
    </SettingsCard>
  );
}
