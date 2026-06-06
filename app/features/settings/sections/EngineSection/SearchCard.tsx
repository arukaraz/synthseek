"use client";

import { useTranslation } from "react-i18next";

import { Switch } from "@components/ui/Switch";
import { useUpdateEngineSearch, useUpdateEngineSmartSearch } from "@hooks/api/mutations/settings/useUpdateEngine";

import { ChipsInput } from "../../components/ChipsInput";
import { EngineRow } from "../../components/EngineRow";
import { ResetDefaultsButton } from "../../components/ResetDefaultsButton";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { cardDivider, cardSectionHeader } from "../../styles";
import { ENGINE_DEFAULTS } from "./defaults";
import type { SearchCardProps } from "./types";

export function SearchCard({ initial }: SearchCardProps) {
  const { t } = useTranslation("settings");
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
    <SettingsCard
      title={t("search.title")}
      trailing={<ResetDefaultsButton onReset={handleResetAll} disabled={isSaving} />}
    >
      <EngineRow
        label={t("search.maxPeerAttempts.label")}
        description={t("search.maxPeerAttempts.description")}
        control={
          <SettingsNumberInput
            value={searchForm.draft.maxPeerAttempts}
            onChange={(v) => searchForm.setField("maxPeerAttempts", v)}
            min={1}
            max={50}
            ariaLabel={t("search.maxPeerAttempts.label")}
          />
        }
      />
      <EngineRow
        label={t("search.maxVariations.label")}
        description={t("search.maxVariations.description")}
        control={
          <SettingsNumberInput
            value={searchForm.draft.maxVariations}
            onChange={(v) => searchForm.setField("maxVariations", v)}
            min={1}
            max={20}
            ariaLabel={t("search.maxVariations.label")}
          />
        }
      />

      <EngineRow
        label={t("search.historyCleanup.label")}
        description={t("search.historyCleanup.description")}
        control={
          <Switch
            checked={searchForm.draft.historyCleanupEnabled}
            onCheckedChange={(v) => searchForm.setField("historyCleanupEnabled", v)}
            aria-label={t("search.historyCleanup.label")}
          />
        }
      />
      <EngineRow
        label={t("search.maxHistorySearches.label")}
        description={t("search.maxHistorySearches.description")}
        control={
          <SettingsNumberInput
            value={searchForm.draft.maxHistorySearches}
            onChange={(v) => searchForm.setField("maxHistorySearches", v)}
            min={5}
            max={100}
            ariaLabel={t("search.maxHistorySearches.label")}
          />
        }
      />

      <div className={cardDivider()} />
      <span className={cardSectionHeader()}>{t("search.smartSearchHeader")}</span>

      <EngineRow
        label={t("search.autoBan.label")}
        anchor="ban-threshold"
        description={t("search.autoBan.description")}
        control={
          <SettingsNumberInput
            value={searchForm.draft.banAfterFailedAttempts}
            onChange={(v) => searchForm.setField("banAfterFailedAttempts", v)}
            min={0}
            max={20}
            ariaLabel={t("search.autoBan.ariaLabel")}
          />
        }
      />

      <SettingsField label={t("search.customMoodKeywords.label")} helper={t("search.customMoodKeywords.helper")}>
        <ChipsInput
          value={smartForm.draft.customMoodKeywords}
          onChange={(v) => smartForm.setField("customMoodKeywords", v)}
          placeholder={t("search.customMoodKeywords.placeholder")}
        />
      </SettingsField>

      <SaveBar isDirty={isDirty} isSaving={isSaving} onSave={handleSave} onCancel={handleCancel} />
    </SettingsCard>
  );
}
