"use client";

import { Switch } from "@components/ui/Switch";
import { useUpdateEnginePlexBehavior } from "@hooks/api/mutations/settings/useUpdateEngine";

import { EngineRow } from "../../components/EngineRow";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { useSettingsForm } from "../../hooks/useSettingsForm";

interface PlexBehaviorCardProps {
  initial: { libraryScan: boolean; playlistSync: boolean };
}

export function PlexBehaviorCard({ initial }: PlexBehaviorCardProps) {
  const update = useUpdateEnginePlexBehavior();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  return (
    <SettingsCard title="Plex behavior" description="Requires a Plex connection. Configure it under Connections.">
      <EngineRow
        label="Library scan"
        description="Trigger a Plex library scan after each successful import."
        control={
          <Switch
            checked={draft.libraryScan}
            onCheckedChange={(v) => setField("libraryScan", v)}
            aria-label="Library scan"
          />
        }
      />
      <EngineRow
        label="Playlist sync"
        description="Mirror Synthseek playlist requests into Plex collections."
        control={
          <Switch
            checked={draft.playlistSync}
            onCheckedChange={(v) => setField("playlistSync", v)}
            aria-label="Playlist sync"
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
