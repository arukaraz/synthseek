"use client";

import { useTranslation } from "react-i18next";

import { useUpdateLibrarySync } from "@hooks/api/mutations/settings/useUpdateLibrarySync";

import { EngineRow } from "../../components/EngineRow";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import type { LibrarySyncCardProps } from "./types";

export function LibrarySyncCard({ initial }: LibrarySyncCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateLibrarySync();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  return (
    <SettingsCard title={t("library.sync.title")} description={t("library.sync.description")}>
      <EngineRow
        anchor="library.syncIntervalMinutes"
        label={t("library.sync.interval.label")}
        description={t("library.sync.interval.description")}
        control={
          <SettingsNumberInput
            value={draft.syncIntervalMinutes}
            onChange={(value) => setField("syncIntervalMinutes", value)}
            min={5}
            max={1440}
            suffix={t("library.sync.interval.suffix")}
            ariaLabel={t("library.sync.interval.label")}
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
