"use client";

import { useMemo } from "react";

import { offeredSources } from "@features/search/components/ConfigRequestModal/helpers";
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
  const initial = useMemo(
    () => (isLoadingSources ? undefined : presetDraft(own, seed, offeredSources(availability, true))),
    [availability, isLoadingSources, own, seed]
  );
  const form = useSettingsForm(initial);

  return (
    <SettingsCard title={title} description={description} anchor={anchor}>
      {form.draft ? (
        <RequestPresetEditor
          value={form.draft}
          onChange={form.setAll}
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
