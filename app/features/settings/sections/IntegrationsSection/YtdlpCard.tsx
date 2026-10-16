"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Switch } from "@components/ui/Switch";

import { useUpdateDownloadSources } from "@hooks/api/mutations/settings/useDownloadSources";
import { EngineRow } from "../../components/EngineRow";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { withoutPriority } from "./helpers";
import { RemoteMediaSearchRows } from "./RemoteMediaSearchRows";
import type { YtdlpCardProps } from "./types";

export function YtdlpCard({ initial }: YtdlpCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateDownloadSources();
  const stored = useMemo(() => withoutPriority(initial.ytdlp), [initial.ytdlp]);
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(stored);

  if (!draft) return null;

  return (
    <SettingsCard title={t("ytdlp.title")} optional description={t("ytdlp.description")} anchor="ytdlp">
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

      <RemoteMediaSearchRows section="ytdlp" values={draft} onFieldChange={(field, value) => setField(field, value)} />

      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={() => save((ytdlp) => update.mutateAsync({ ytdlp }))}
        onCancel={reset}
      />
    </SettingsCard>
  );
}
