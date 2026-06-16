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
import type { YtdlpCardProps } from "./types";

export function YtdlpCard({ initial }: YtdlpCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateDownloadSources();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial.ytdlp);

  if (!draft) return null;

  return (
    <SettingsCard title={t("ytdlp.title")} optional description={t("ytdlp.description")}>
      <EngineRow
        label={t("ytdlp.enable.label")}
        description={t("ytdlp.enable.description")}
        control={
          <Switch
            checked={draft.enabled}
            onCheckedChange={(v) => setField("enabled", v)}
            aria-label={t("ytdlp.enable.ariaLabel")}
          />
        }
      />

      {/* Priority is hidden until there are enough sources to reorder (value stays at 10). Re-enable when more sources exist:
      <EngineRow
        label="Priority"
        description="Lower runs first. Currently slskd defaults to 0, so slskd is tried before any other source.."
        control={
          <SettingsNumberInput
            value={draft.priority}
            onChange={(v) => setField("priority", v)}
            min={0}
            max={100}
            ariaLabel="yt-dlp priority"
          />
        }
      />
      */}

      <EngineRow
        label={t("ytdlp.searchResults.label")}
        description={t("ytdlp.searchResults.description")}
        control={
          <SettingsNumberInput
            value={draft.searchResults}
            onChange={(v) => setField("searchResults", v)}
            min={1}
            max={20}
            ariaLabel={t("ytdlp.searchResults.ariaLabel")}
          />
        }
      />

      <EngineRow
        label={t("ytdlp.maxDurationDelta.label")}
        description={t("ytdlp.maxDurationDelta.description")}
        control={
          <SettingsNumberInput
            value={draft.maxDurationDeltaSec}
            onChange={(v) => setField("maxDurationDeltaSec", v)}
            min={0}
            max={120}
            suffix="s"
            ariaLabel={t("ytdlp.maxDurationDelta.ariaLabel")}
          />
        }
      />

      <EngineRow
        label={t("ytdlp.searchTimeout.label")}
        description={t("ytdlp.searchTimeout.description")}
        control={
          <SettingsNumberInput
            value={Math.round(draft.searchTimeout / MS)}
            onChange={(v) => setField("searchTimeout", v * MS)}
            min={5}
            max={120}
            suffix="s"
            ariaLabel={t("ytdlp.searchTimeout.ariaLabel")}
          />
        }
      />

      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={() => save((payload) => update.mutateAsync({ slskd: initial.slskd, ytdlp: payload }))}
        onCancel={reset}
      />
    </SettingsCard>
  );
}
