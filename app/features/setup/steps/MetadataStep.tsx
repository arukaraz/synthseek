"use client";

import { Mail } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useUpdateConnectionsEnrichment } from "@hooks/api/mutations/settings/useUpdateConnections";
import { useSettings } from "@hooks/api/queries/useSettings";

import { QuestionFrame } from "../components/QuestionFrame";
import { StatusStrip } from "../components/StatusStrip";
import { StepActions } from "../components/StepActions";
import { TextField } from "../components/TextField";
import { isValidEmail } from "../helpers";
import { useRecordStep } from "../hooks/useRecordStep";
import { setupForm } from "../styles";
import type { StepProps } from "../types";

export function MetadataStep({ onGo }: StepProps) {
  const { t } = useTranslation("setup");
  const enrichment = useSettings().data?.connections.enrichment;
  const update = useUpdateConnectionsEnrichment({ silent: true });
  const { record, pending, failure, clearFailure } = useRecordStep("metadata", onGo);
  const [edited, setEdited] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const email = edited ?? enrichment?.musicbrainzEmail ?? "";
  const invalid = attempted && !isValidEmail(email);

  const handleChange = (value: string) => {
    setEdited(value);
    setSaveFailed(false);
    clearFailure();
  };

  const handleContinue = async () => {
    if (!enrichment) return;
    if (!isValidEmail(email)) {
      setAttempted(true);
      return;
    }
    setSaveFailed(false);
    try {
      await update.mutateAsync({ ...enrichment, musicbrainzEmail: email.trim() });
    } catch {
      setSaveFailed(true);
      return;
    }
    await record("answered", "summary");
  };

  return (
    <QuestionFrame step="metadata" focusKey="metadata" title={t("metadata.title")}>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void handleContinue();
        }}
        className={setupForm()}
      >
        <TextField
          label={t("metadata.label")}
          value={email}
          onChange={handleChange}
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder={t("metadata.placeholder")}
          hint={t("metadata.hint")}
          error={invalid ? t("metadata.emailError") : null}
        />
        {saveFailed ? <StatusStrip tone="error" message={t("metadata.saveFailed")} /> : null}
        {failure ? <StatusStrip tone="error" message={failure} /> : null}
        <StepActions
          onBack={() => onGo("downloads")}
          forwardType="submit"
          forwardLabel={t("actions.continue")}
          forwardBusy={pending || update.isPending}
          forwardDisabled={!enrichment}
          onSkip={() => void record("skipped", "summary")}
        />
      </form>
    </QuestionFrame>
  );
}
