"use client";

import { useUpdateConnectionsEnrichment } from "@hooks/api/mutations/settings/useUpdateConnections";

import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsSecretInput } from "../../components/SettingsSecretInput";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import type { ArtworkCardProps } from "./types";

export function ArtworkCard({ initial }: ArtworkCardProps) {
  const update = useUpdateConnectionsEnrichment();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  return (
    <SettingsCard title="Artwork" optional>
      <SettingsField label="FanART API key">
        <SettingsSecretInput value={draft.fanartApiKey} onChange={(v) => setField("fanartApiKey", v)} />
      </SettingsField>
      <SettingsField
        label="MusicBrainz contact email"
        helper="Required by MusicBrainz in the User-Agent header. Without it, Synthseek shares a public default and may be rate-limited."
      >
        <SettingsTextInput
          value={draft.musicbrainzEmail}
          onChange={(v) => setField("musicbrainzEmail", v)}
          type="email"
          placeholder="you@example.com"
        />
      </SettingsField>
      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={() => save((payload) => update.mutateAsync(payload))}
        onCancel={reset}
      />
    </SettingsCard>
  );
}
