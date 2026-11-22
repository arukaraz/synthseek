"use client";

import { useMemo } from "react";

import { offeredSources, selectionFromPreset } from "@features/search/components/ConfigRequestModal/helpers";
import { useDownloadSourcesAvailability } from "@hooks/api";

import { useSettingsForm } from "../../hooks/useSettingsForm";
import { SaveBar } from "../SaveBar";
import { SettingsCard } from "../SettingsCard";
import { presetDraft, presetFromDraft } from "./helpers";
import { RequestPresetEditor } from "./RequestPresetEditor";
import type { RequestPresetCardProps } from "./types";

export function RequestPresetCard({
  title,
  description,
  anchor,
  own,
  seed,
  followLabel,
  customLabel,
  followSummary,
  onSave,
}: RequestPresetCardProps) {
  const { data: availability, isPending: isLoadingSources } = useDownloadSourcesAvailability();
  const offered = useMemo(() => offeredSources(availability, true), [availability]);
  const initial = useMemo(
    () => (isLoadingSources ? undefined : presetDraft(own, seed, offered)),
    [isLoadingSources, own, seed, offered]
  );
  const base = useMemo(() => selectionFromPreset(seed, offered), [seed, offered]);
  const form = useSettingsForm(initial);

  return (
    <SettingsCard title={title} description={description} anchor={anchor}>
      {form.draft ? (
        <RequestPresetEditor
          value={form.draft}
          onChange={form.setAll}
          base={base}
          offered={offered}
          followLabel={followLabel}
          customLabel={customLabel}
          followSummary={followSummary}
        />
      ) : null}
      <SaveBar
        isDirty={form.isDirty}
        isSaving={form.isSaving}
        onSave={() => form.save((draft) => onSave(presetFromDraft(draft)))}
        onCancel={form.reset}
      />
    </SettingsCard>
  );
}
