"use client";

import { useUpdateConnectionsEnrichment } from "@hooks/api/mutations/settings/useUpdateConnections";

import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsSecretInput } from "../../components/SettingsSecretInput";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";

interface EnrichmentCardProps {
  initial: {
    lastfmApiKey: string;
    fanartApiKey: string;
    songlinkApiKey: string;
    acoustidApiKey: string;
    musicbrainzEmail: string;
  };
}

export function EnrichmentCard({ initial }: EnrichmentCardProps) {
  const update = useUpdateConnectionsEnrichment();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  return (
    <SettingsCard
      title="Metadata enrichment"
      description="API keys for the services that fill out track metadata, art and discovery hints."
    >
      <SettingsField label="Last.fm API key">
        <SettingsSecretInput value={draft.lastfmApiKey} onChange={(v) => setField("lastfmApiKey", v)} />
      </SettingsField>

      <SettingsField label="FanART API key">
        <SettingsSecretInput value={draft.fanartApiKey} onChange={(v) => setField("fanartApiKey", v)} />
      </SettingsField>

      <SettingsField label="Songlink API key">
        <SettingsSecretInput value={draft.songlinkApiKey} onChange={(v) => setField("songlinkApiKey", v)} />
      </SettingsField>

      <SettingsField label="AcoustID API key">
        <SettingsSecretInput value={draft.acoustidApiKey} onChange={(v) => setField("acoustidApiKey", v)} />
      </SettingsField>

      <SettingsField label="MusicBrainz contact email" helper="Required by MusicBrainz API policy.">
        <SettingsTextInput
          value={draft.musicbrainzEmail}
          onChange={(v) => setField("musicbrainzEmail", v)}
          placeholder="you@example.com"
          type="email"
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
