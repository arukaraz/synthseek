"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { Switch } from "@components/ui/Switch";

import { useEmptyRecycleBin, useUpdateLibraryRecycleBin } from "@hooks/api/mutations/settings/useRecycleBin";
import { useUpdateEngineQuality } from "@hooks/api/mutations/settings/useUpdateEngine";
import { useRecycleBinStatus } from "@hooks/api/queries/useRecycleBin";
import { formatBytes, formatDate } from "@utils/formatters";

import { EngineRow } from "../../components/EngineRow";
import { ResetDefaultsButton } from "../../components/ResetDefaultsButton";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { cardDivider, cardSectionHeader } from "../../styles";
import { ENGINE_DEFAULTS } from "./defaults";
import { quarantineListHeader, quarantineValue } from "./styles";
import type { QualityCardProps } from "./types";

export function QualityCard({ initial, recycleBin }: QualityCardProps) {
  const { t } = useTranslation("settings");
  const updateQuality = useUpdateEngineQuality();
  const updateRecycleBin = useUpdateLibraryRecycleBin();
  const emptyBin = useEmptyRecycleBin();
  const status = useRecycleBinStatus();
  const qualityForm = useSettingsForm(initial);
  const recycleForm = useSettingsForm(recycleBin);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!qualityForm.draft || !recycleForm.draft) return null;

  const hasEntries = Boolean(status.data && status.data.entryCount > 0);

  return (
    <SettingsCard
      title={t("quality.title")}
      description={t("quality.description")}
      trailing={
        <ResetDefaultsButton
          onReset={() => qualityForm.setAll({ ...ENGINE_DEFAULTS.quality })}
          disabled={qualityForm.isSaving}
        />
      }
    >
      <EngineRow
        label={t("quality.upgradeEnabled.label")}
        description={t("quality.upgradeEnabled.description")}
        control={
          <Switch
            checked={qualityForm.draft.upgradeEnabled}
            onCheckedChange={(v) => qualityForm.setField("upgradeEnabled", v)}
            aria-label={t("quality.upgradeEnabled.label")}
          />
        }
      />
      <SaveBar
        isDirty={qualityForm.isDirty}
        isSaving={qualityForm.isSaving}
        onSave={() => qualityForm.save((payload) => updateQuality.mutateAsync(payload))}
        onCancel={qualityForm.reset}
      />

      <div role="separator" className={cardDivider()} />
      <div className={quarantineListHeader()}>
        <span className={cardSectionHeader()}>{t("quality.recycleBin.sectionTitle")}</span>
        {hasEntries ? (
          <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)} disabled={emptyBin.isPending}>
            <Trash2 className="size-4" />
            {t("quality.recycleBin.empty.action")}
          </Button>
        ) : null}
      </div>

      <EngineRow
        label={t("quality.recycleBin.retentionDays.label")}
        description={t("quality.recycleBin.retentionDays.description")}
        control={
          <SettingsNumberInput
            value={recycleForm.draft.retentionDays}
            onChange={(v) => recycleForm.setField("retentionDays", v)}
            min={1}
            max={365}
            suffix={t("quality.recycleBin.retentionDays.suffix")}
            ariaLabel={t("quality.recycleBin.retentionDays.ariaLabel")}
          />
        }
      />
      <SaveBar
        isDirty={recycleForm.isDirty}
        isSaving={recycleForm.isSaving}
        onSave={() => recycleForm.save((payload) => updateRecycleBin.mutateAsync(payload))}
        onCancel={recycleForm.reset}
      />

      {status.isLoading ? (
        <span className="text-fg/60 text-sm">{t("quality.recycleBin.status.loading")}</span>
      ) : status.isError ? (
        <span className="text-sm text-red-400">{t("quality.recycleBin.status.loadError")}</span>
      ) : status.data ? (
        <>
          <EngineRow
            label={t("quality.recycleBin.status.size.label")}
            description={t("quality.recycleBin.status.size.description")}
            control={<span className={quarantineValue()}>{formatBytes(status.data.totalBytes)}</span>}
          />
          <EngineRow
            label={t("quality.recycleBin.status.entries.label")}
            description={t("quality.recycleBin.status.entries.description")}
            control={<span className={quarantineValue()}>{status.data.entryCount}</span>}
          />
          <EngineRow
            label={t("quality.recycleBin.status.oldest.label")}
            description={t("quality.recycleBin.status.oldest.description")}
            control={
              <span className={quarantineValue()}>
                {status.data.oldestDate ? formatDate(new Date(status.data.oldestDate)) : "-"}
              </span>
            }
          />
        </>
      ) : null}

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => emptyBin.mutate()}
        title={t("quality.recycleBin.empty.confirmTitle")}
        message={t("quality.recycleBin.empty.confirmMessage")}
        confirmText={t("quality.recycleBin.empty.confirm")}
        variant="danger"
      />
    </SettingsCard>
  );
}
