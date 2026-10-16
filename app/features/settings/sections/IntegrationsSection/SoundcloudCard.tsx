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
import type { SoundcloudCardProps } from "./types";

export function SoundcloudCard({ initial }: SoundcloudCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateDownloadSources();
  const stored = useMemo(() => withoutPriority(initial.soundcloud), [initial.soundcloud]);
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(stored);

  if (!draft) return null;

  return (
    <SettingsCard title={t("soundcloud.title")} optional description={t("soundcloud.description")} anchor="soundcloud">
      <EngineRow
        label={t("soundcloud.enable.label")}
        description={t("soundcloud.enable.description")}
        control={
          <Switch
            checked={draft.enabled}
            onCheckedChange={(v) => setField("enabled", v)}
            aria-label={t("soundcloud.enable.ariaLabel")}
          />
        }
      />

      <RemoteMediaSearchRows
        section="soundcloud"
        values={draft}
        onFieldChange={(field, value) => setField(field, value)}
      />

      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={() => save((soundcloud) => update.mutateAsync({ soundcloud }))}
        onCancel={reset}
      />
    </SettingsCard>
  );
}
