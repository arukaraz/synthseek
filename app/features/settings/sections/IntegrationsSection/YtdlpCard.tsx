"use client";

import { Switch } from "@components/ui/Switch";

import { useUpdateDownloadSources } from "@hooks/api/mutations/settings/useDownloadSources";
import { EngineRow } from "../../components/EngineRow";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import type { YtdlpCardProps } from "./types";

export function YtdlpCard({ initial }: YtdlpCardProps) {
  const update = useUpdateDownloadSources();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial.ytdlp);

  if (!draft) return null;

  return (
    <SettingsCard
      title="yt-dlp"
      optional
      description="Fallback source used when slskd cannot deliver a track. Format and quality follow each request's own config. Requires yt-dlp and ffmpeg in the container."
    >
      <EngineRow
        label="Enable"
        description="When on, tracks that fail on higher-priority sources are retried via yt-dlp within the same job."
        control={
          <Switch
            checked={draft.enabled}
            onCheckedChange={(v) => setField("enabled", v)}
            aria-label="Enable yt-dlp fallback"
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
        label="Search results"
        description="How many YouTube candidates to fetch per track before scoring by duration and title."
        control={
          <SettingsNumberInput
            value={draft.searchResults}
            onChange={(v) => setField("searchResults", v)}
            min={1}
            max={20}
            ariaLabel="Search results"
          />
        }
      />

      <EngineRow
        label="Max duration delta"
        description="Reject candidates whose length differs from the expected track by more than this many seconds."
        control={
          <SettingsNumberInput
            value={draft.maxDurationDeltaSec}
            onChange={(v) => setField("maxDurationDeltaSec", v)}
            min={0}
            max={120}
            suffix="s"
            ariaLabel="Max duration delta seconds"
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
