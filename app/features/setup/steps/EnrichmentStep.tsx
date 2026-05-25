"use client";

import { useState } from "react";

import { useUpdateConnectionsEnrichment } from "@hooks/api/mutations/settings/useUpdateConnections";
import { SettingsField } from "@features/settings/components/SettingsField";
import { SettingsSecretInput } from "@features/settings/components/SettingsSecretInput";
import { SettingsTextInput } from "@features/settings/components/SettingsTextInput";

import { StepShell } from "./StepShell";

interface EnrichmentStepProps {
  stepIndex: number;
  totalSteps: number;
  onComplete: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function EnrichmentStep({ stepIndex, totalSteps, onComplete, onBack, onSkip }: EnrichmentStepProps) {
  const update = useUpdateConnectionsEnrichment();
  const [draft, setDraft] = useState({
    lastfmApiKey: "",
    fanartApiKey: "",
    songlinkApiKey: "",
    acoustidApiKey: "",
    musicbrainzEmail: "",
  });

  const update1 = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => setDraft((p) => ({ ...p, [k]: v }));

  const handleContinue = async () => {
    try {
      await update.mutateAsync(draft);
      onComplete();
    } catch {
      /* toast handled by hook */
    }
  };

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      title="Metadata enrichment (optional)"
      description="Improves how Synthseek labels, scores, and recommends tracks. All keys are optional."
      primaryLabel="Continue"
      primaryLoading={update.isPending}
      onPrimary={handleContinue}
      secondaryLabel="Skip"
      onSecondary={onSkip}
      showBack
      onBack={onBack}
    >
      <SettingsField label="Last.fm API key">
        <SettingsSecretInput value={draft.lastfmApiKey} onChange={(v) => update1("lastfmApiKey", v)} />
      </SettingsField>
      <SettingsField label="FanART API key">
        <SettingsSecretInput value={draft.fanartApiKey} onChange={(v) => update1("fanartApiKey", v)} />
      </SettingsField>
      <SettingsField label="Songlink API key">
        <SettingsSecretInput value={draft.songlinkApiKey} onChange={(v) => update1("songlinkApiKey", v)} />
      </SettingsField>
      <SettingsField label="AcoustID API key">
        <SettingsSecretInput value={draft.acoustidApiKey} onChange={(v) => update1("acoustidApiKey", v)} />
      </SettingsField>
      <SettingsField label="MusicBrainz contact email">
        <SettingsTextInput
          value={draft.musicbrainzEmail}
          onChange={(v) => update1("musicbrainzEmail", v)}
          placeholder="you@example.com"
          type="email"
        />
      </SettingsField>
    </StepShell>
  );
}
