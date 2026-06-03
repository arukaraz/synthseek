"use client";

import { Mail } from "lucide-react";
import { useId, useState } from "react";

import { PasswordField } from "@components/ui/PasswordField";
import { authInputControl, authInputIcon, authInputRow } from "@components/ui/styles";
import { useUpdateConnectionsEnrichment } from "@hooks/api/mutations/settings/useUpdateConnections";

import { StatusStrip } from "../components/StatusStrip";
import { ENRICHMENT_COPY, ENRICHMENT_FIELD_DESCRIPTIONS, SETUP_HEADING_IDS } from "../constants";
import { fieldGroup, fieldHint, fieldLabel } from "../styles";
import { StepShell } from "./StepShell";
import type { EnrichmentStepProps } from "../types";

export function EnrichmentStep({ stepIndex, totalSteps, onComplete, onBack, onSkip }: EnrichmentStepProps) {
  const update = useUpdateConnectionsEnrichment();
  const lastfmId = useId();
  const lastfmHintId = useId();
  const fanartId = useId();
  const fanartHintId = useId();
  const songlinkId = useId();
  const songlinkHintId = useId();
  const acoustidId = useId();
  const acoustidHintId = useId();
  const musicbrainzId = useId();
  const musicbrainzHintId = useId();
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
      <div className={fieldGroup()}>
        <PasswordField
          id={lastfmId}
          value={draft.lastfmApiKey}
          onChange={(v) => update1("lastfmApiKey", v)}
          label="Last.fm API key"
          autoComplete="off"
          describedBy={lastfmHintId}
        />
        <p id={lastfmHintId} className={fieldHint()}>
          {ENRICHMENT_FIELD_DESCRIPTIONS.lastfm}
        </p>
      </div>
      <div className={fieldGroup()}>
        <PasswordField
          id={fanartId}
          value={draft.fanartApiKey}
          onChange={(v) => update1("fanartApiKey", v)}
          label="FanART API key"
          autoComplete="off"
          describedBy={fanartHintId}
        />
        <p id={fanartHintId} className={fieldHint()}>
          {ENRICHMENT_FIELD_DESCRIPTIONS.fanart}
        </p>
      </div>
      <div className={fieldGroup()}>
        <PasswordField
          id={songlinkId}
          value={draft.songlinkApiKey}
          onChange={(v) => update1("songlinkApiKey", v)}
          label="Songlink API key"
          autoComplete="off"
          describedBy={songlinkHintId}
        />
        <p id={songlinkHintId} className={fieldHint()}>
          {ENRICHMENT_FIELD_DESCRIPTIONS.songlink}
        </p>
      </div>
      <div className={fieldGroup()}>
        <PasswordField
          id={acoustidId}
          value={draft.acoustidApiKey}
          onChange={(v) => update1("acoustidApiKey", v)}
          label="AcoustID API key"
          autoComplete="off"
          describedBy={acoustidHintId}
        />
        <p id={acoustidHintId} className={fieldHint()}>
          {ENRICHMENT_FIELD_DESCRIPTIONS.acoustid}
        </p>
      </div>
      <div className={fieldGroup()}>
        <label htmlFor={musicbrainzId} className={fieldLabel()}>
          MusicBrainz contact email
        </label>
        <div className={authInputRow()}>
          <Mail className={authInputIcon()} aria-hidden="true" />
          <input
            id={musicbrainzId}
            type="email"
            value={draft.musicbrainzEmail}
            onChange={(e) => update1("musicbrainzEmail", e.target.value)}
            placeholder="you@example.com"
            autoComplete="off"
            aria-describedby={musicbrainzHintId}
            className={authInputControl()}
          />
        </div>
        <p id={musicbrainzHintId} className={fieldHint()}>
          {ENRICHMENT_FIELD_DESCRIPTIONS.musicbrainzEmail}
        </p>
      </div>
    </StepShell>
  );
}
