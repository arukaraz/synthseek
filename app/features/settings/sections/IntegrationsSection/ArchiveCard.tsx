"use client";

import { useTranslation } from "react-i18next";

import { Switch } from "@components/ui/Switch";

import { useUpdateDownloadSources } from "@hooks/api/mutations/settings/useDownloadSources";
import { EngineRow } from "../../components/EngineRow";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { MS } from "./constants";
import { cardNotice } from "./styles";
import type { ArchiveCardProps } from "./types";

export function ArchiveCard({ initial }: ArchiveCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateDownloadSources();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial.archive);

  if (!draft) return null;

  const { collections } = draft;
  const noCollection = draft.enabled && !Object.values(collections).some(Boolean);

  return (
    <SettingsCard title={t("archive.title")} optional description={t("archive.description")}>
      <EngineRow
        label={t("archive.enable.label")}
        description={t("archive.enable.description")}
        control={
          <Switch
            checked={draft.enabled}
            onCheckedChange={(v) => setField("enabled", v)}
            aria-label={t("archive.enable.ariaLabel")}
          />
        }
      />

      <EngineRow
        label={t("archive.netlabels.label")}
        description={t("archive.netlabels.description")}
        control={
          <Switch
            checked={collections.netlabels}
            onCheckedChange={(v) => setField("collections", { ...collections, netlabels: v })}
            aria-label={t("archive.netlabels.ariaLabel")}
          />
        }
      />

      <EngineRow
        label={t("archive.etree.label")}
        description={t("archive.etree.description")}
        control={
          <Switch
            checked={collections.etree}
            onCheckedChange={(v) => setField("collections", { ...collections, etree: v })}
            aria-label={t("archive.etree.ariaLabel")}
          />
        }
      />

      <EngineRow
        label={t("archive.community.label")}
        description={t("archive.community.description")}
        control={
          <Switch
            checked={collections.community}
            onCheckedChange={(v) => setField("collections", { ...collections, community: v })}
            aria-label={t("archive.community.ariaLabel")}
          />
        }
      />

      {noCollection && <p className={cardNotice()}>{t("archive.noCollection")}</p>}

      <EngineRow
        label={t("archive.searchTimeout.label")}
        description={t("archive.searchTimeout.description")}
        control={
          <SettingsNumberInput
            value={Math.round(draft.searchTimeout / MS)}
            onChange={(v) => setField("searchTimeout", v * MS)}
            min={5}
            max={120}
            suffix="s"
            ariaLabel={t("archive.searchTimeout.ariaLabel")}
          />
        }
      />

      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={() => save((payload) => update.mutateAsync({ ...initial, archive: payload }))}
        onCancel={reset}
      />
    </SettingsCard>
  );
}
