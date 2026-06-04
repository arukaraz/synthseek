"use client";

import { useTranslation } from "react-i18next";

import { useUpdateEngineQueue } from "@hooks/api/mutations/settings/useUpdateEngine";

import { EngineRow } from "../../components/EngineRow";
import { ResetDefaultsButton } from "../../components/ResetDefaultsButton";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { ENGINE_DEFAULTS } from "./defaults";
import type { QueueCardProps } from "./types";

export function QueueCard({ initial }: QueueCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateEngineQueue();
  const { draft, setField, setAll, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  return (
    <SettingsCard
      title={t("queue.title")}
      trailing={<ResetDefaultsButton onReset={() => setAll({ ...ENGINE_DEFAULTS.queue })} disabled={isSaving} />}
    >
      <EngineRow
        label={t("queue.maxSize.label")}
        description={t("queue.maxSize.description")}
        control={
          <SettingsNumberInput
            value={draft.maxSize}
            onChange={(v) => setField("maxSize", v)}
            min={10}
            max={10000}
            ariaLabel={t("queue.maxSize.ariaLabel")}
          />
        }
      />
      <EngineRow
        label={t("queue.maxConcurrentSearches.label")}
        description={t("queue.maxConcurrentSearches.description")}
        control={
          <SettingsNumberInput
            value={draft.maxConcurrentSearches}
            onChange={(v) => setField("maxConcurrentSearches", v)}
            min={1}
            max={10}
            ariaLabel={t("queue.maxConcurrentSearches.ariaLabel")}
          />
        }
      />
      <EngineRow
        label={t("queue.maxPendingImports.label")}
        description={t("queue.maxPendingImports.description")}
        control={
          <SettingsNumberInput
            value={draft.maxPendingImports}
            onChange={(v) => setField("maxPendingImports", v)}
            min={1}
            max={20}
            ariaLabel={t("queue.maxPendingImports.ariaLabel")}
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
