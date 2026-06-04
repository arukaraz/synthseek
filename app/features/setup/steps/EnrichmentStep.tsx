"use client";

import { Mail } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { PasswordField } from "@components/ui/PasswordField";
import { authInputControl, authInputIcon, authInputRow } from "@components/ui/styles";
import { useUpdateConnectionsEnrichment } from "@hooks/api/mutations/settings/useUpdateConnections";

import { StatusStrip } from "../components/StatusStrip";
import { SETUP_HEADING_IDS } from "../constants";
import { fieldGroup, fieldHint, fieldLabel } from "../styles";
import { StepShell } from "./StepShell";
import type { EnrichmentStepProps } from "../types";

export function EnrichmentStep({ stepIndex, totalSteps, onComplete, onBack, onSkip }: EnrichmentStepProps) {
  const { t } = useTranslation("setup");
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
      setError(t("enrichment.saveFailed"));
    }
  };

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      headingId={SETUP_HEADING_IDS.enrichment}
      title={t("enrichment.title")}
      description={t("enrichment.description")}
      primaryLabel={update.isPending ? t("actions.saving") : t("actions.continue")}
      primaryLoading={update.isPending}
      onPrimary={handleContinue}
      secondaryLabel={t("actions.skip")}
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
          label={t("enrichment.lastfmLabel")}
          autoComplete="off"
          describedBy={lastfmHintId}
        />
        <p id={lastfmHintId} className={fieldHint()}>
          {t("enrichment.lastfmHint")}
        </p>
      </div>
      <div className={fieldGroup()}>
        <PasswordField
          id={fanartId}
          value={draft.fanartApiKey}
          onChange={(v) => update1("fanartApiKey", v)}
          label={t("enrichment.fanartLabel")}
          autoComplete="off"
          describedBy={fanartHintId}
        />
        <p id={fanartHintId} className={fieldHint()}>
          {t("enrichment.fanartHint")}
        </p>
      </div>
      <div className={fieldGroup()}>
        <PasswordField
          id={songlinkId}
          value={draft.songlinkApiKey}
          onChange={(v) => update1("songlinkApiKey", v)}
          label={t("enrichment.songlinkLabel")}
          autoComplete="off"
          describedBy={songlinkHintId}
        />
        <p id={songlinkHintId} className={fieldHint()}>
          {t("enrichment.songlinkHint")}
        </p>
      </div>
      <div className={fieldGroup()}>
        <PasswordField
          id={acoustidId}
          value={draft.acoustidApiKey}
          onChange={(v) => update1("acoustidApiKey", v)}
          label={t("enrichment.acoustidLabel")}
          autoComplete="off"
          describedBy={acoustidHintId}
        />
        <p id={acoustidHintId} className={fieldHint()}>
          {t("enrichment.acoustidHint")}
        </p>
      </div>
      <div className={fieldGroup()}>
        <label htmlFor={musicbrainzId} className={fieldLabel()}>
          {t("enrichment.musicbrainzLabel")}
        </label>
        <div className={authInputRow()}>
          <Mail className={authInputIcon()} aria-hidden="true" />
          <input
            id={musicbrainzId}
            type="email"
            value={draft.musicbrainzEmail}
            onChange={(e) => update1("musicbrainzEmail", e.target.value)}
            placeholder={t("enrichment.musicbrainzPlaceholder")}
            autoComplete="off"
            aria-describedby={musicbrainzHintId}
            className={authInputControl()}
          />
        </div>
        <p id={musicbrainzHintId} className={fieldHint()}>
          {t("enrichment.musicbrainzHint")}
        </p>
      </div>
    </StepShell>
  );
}
