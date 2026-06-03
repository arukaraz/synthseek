"use client";

import { useId, useState } from "react";

import { useUpdateConnectionsEnrichment } from "@hooks/api/mutations/settings/useUpdateConnections";
import { SettingsField } from "@features/settings/components/SettingsField";
import { SettingsSecretInput } from "@features/settings/components/SettingsSecretInput";
import { SettingsTextInput } from "@features/settings/components/SettingsTextInput";

import { StatusStrip } from "../components/StatusStrip";
import { ENRICHMENT_COPY, ENRICHMENT_FIELD_DESCRIPTIONS, SETUP_HEADING_IDS } from "../constants";
import { StepShell } from "./StepShell";
import type { EnrichmentStepProps } from "../types";

export function EnrichmentStep({ stepIndex, totalSteps, onComplete, onBack, onSkip }: EnrichmentStepProps) {
  const update = useUpdateConnectionsEnrichment();
  const lastfmId = useId();
  const fanartId = useId();
  const songlinkId = useId();
  const acoustidId = useId();
  const musicbrainzId = useId();
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    lastfmApiKey: "",
    fanartApiKey: "",
    songlinkApiKey: "",
    acoustidApiKey: "",
    musicbrainzEmail: "",
  });

  const update1 = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => {
    setDraft((p) => ({ ...p, [k]: v }));
    if (error) setError(null);
  };

  const handleContinue = async () => {
    setError(null);
    try {
      await update.mutateAsync(draft);
      onComplete();
    } catch {
      setError(ENRICHMENT_COPY.saveFailed);
    }
  };

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      headingId={SETUP_HEADING_IDS.enrichment}
      title="Metadata enrichment (optional)"
      description="Improves how Synthseek labels, scores, and recommends tracks. All keys are optional but recommended."
      primaryLabel={update.isPending ? "Saving..." : "Continue"}
      primaryLoading={update.isPending}
      onPrimary={handleContinue}
      secondaryLabel="Skip"
      onSecondary={onSkip}
      showBack
      onBack={onBack}
      footerError={error ? <StatusStrip tone="error" message={error} /> : undefined}
    >
      <SettingsField label="Last.fm API key" htmlFor={lastfmId} helper={ENRICHMENT_FIELD_DESCRIPTIONS.lastfm}>
        <SettingsSecretInput id={lastfmId} value={draft.lastfmApiKey} onChange={(v) => update1("lastfmApiKey", v)} />
      </SettingsField>
      <SettingsField label="FanART API key" htmlFor={fanartId} helper={ENRICHMENT_FIELD_DESCRIPTIONS.fanart}>
        <SettingsSecretInput id={fanartId} value={draft.fanartApiKey} onChange={(v) => update1("fanartApiKey", v)} />
      </SettingsField>
      <SettingsField label="Songlink API key" htmlFor={songlinkId} helper={ENRICHMENT_FIELD_DESCRIPTIONS.songlink}>
        <SettingsSecretInput
          id={songlinkId}
          value={draft.songlinkApiKey}
          onChange={(v) => update1("songlinkApiKey", v)}
        />
      </SettingsField>
      <SettingsField label="AcoustID API key" htmlFor={acoustidId} helper={ENRICHMENT_FIELD_DESCRIPTIONS.acoustid}>
        <SettingsSecretInput
          id={acoustidId}
          value={draft.acoustidApiKey}
          onChange={(v) => update1("acoustidApiKey", v)}
        />
      </SettingsField>
      <SettingsField
        label="MusicBrainz contact email"
        htmlFor={musicbrainzId}
        helper={ENRICHMENT_FIELD_DESCRIPTIONS.musicbrainzEmail}
      >
        <SettingsTextInput
          id={musicbrainzId}
          value={draft.musicbrainzEmail}
          onChange={(v) => update1("musicbrainzEmail", v)}
          placeholder="you@example.com"
          type="email"
        />
      </SettingsField>
    </StepShell>
  );
}
