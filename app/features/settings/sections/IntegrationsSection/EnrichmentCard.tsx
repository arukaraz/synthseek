"use client";

import { useUpdateConnectionsEnrichment } from "@hooks/api/mutations/settings/useUpdateConnections";

import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsSecretInput } from "../../components/SettingsSecretInput";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import type { EnrichmentCardProps } from "./types";

export function EnrichmentCard({ initial }: EnrichmentCardProps) {
  const update = useUpdateConnectionsEnrichment();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  return (
    <SettingsCard
      title="Metadata Enrichment"
      optional
      description="External services that enrich your library with artwork, fingerprinting fallbacks, and tagging data. All optional but recommended, leave empty to fall back to public defaults or skip the feature."
    >
      <SettingsField label="FanART API key" helper="Artwork sourcing.">
        <SettingsSecretInput value={draft.fanartApiKey} onChange={(v) => setField("fanartApiKey", v)} />
      </SettingsField>

      <SettingsField
        label="MusicBrainz contact email"
        helper="Required. Without it, Synthseek shares rate-limited email."
      >
        <SettingsTextInput
          value={draft.musicbrainzEmail}
          onChange={(v) => setField("musicbrainzEmail", v)}
          type="email"
          placeholder="you@example.com"
        />
      </SettingsField>

      <SettingsField
        label="AcoustID API key"
        helper="Audio fingerprinting fallback for tracks without reliable tag metadata."
      >
        <SettingsSecretInput value={draft.acoustidApiKey} onChange={(v) => setField("acoustidApiKey", v)} />
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
