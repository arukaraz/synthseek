"use client";

import { Plug } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@components/ui/Button";
import { SettingsField } from "@features/settings/components/SettingsField";
import { SettingsSecretInput } from "@features/settings/components/SettingsSecretInput";
import { SettingsTextInput } from "@features/settings/components/SettingsTextInput";
import { useTestSlskd, useUpdateConnectionsSlskd } from "@hooks/api/mutations/settings/useUpdateConnections";
import { validateSlskdApiUrl } from "@utils/slskd-url";

import { StatusStrip } from "../components/StatusStrip";
import { SETUP_HEADING_IDS, SLSKD_COPY } from "../constants";
import { fieldError, fieldWarning, slskdTestRow, statusStripAction } from "../styles";
import { StepShell } from "./StepShell";
import type { SlskdConnectState, SlskdStepProps } from "../types";

export function SlskdStep({ stepIndex, totalSteps, onComplete, onBack }: SlskdStepProps) {
  const update = useUpdateConnectionsSlskd();
  const testConn = useTestSlskd();
  const apiUrlId = useId();
  const apiKeyId = useId();
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [state, setState] = useState<SlskdConnectState>({ kind: "untested" });

  const urlCheck = validateSlskdApiUrl(apiUrl);
  const urlError = apiUrl.length > 0 && !urlCheck.ok ? urlCheck.error : undefined;
  const urlWarning = urlCheck.ok ? urlCheck.warning : undefined;

  const fieldsFilled = urlCheck.ok && apiKey.length > 0;
  const canContinue =
    fieldsFilled && (state.kind === "passed" || state.kind === "override-armed" || state.kind === "save-failed");

  const resetVerification = () => {
    if (state.kind !== "untested") setState({ kind: "untested" });
  };

  const handleUrlChange = (value: string) => {
    setApiUrl(value);
    resetVerification();
  };

  const handleKeyChange = (value: string) => {
    setApiKey(value);
    resetVerification();
  };

  const handleTest = async () => {
    setState({ kind: "testing" });
    try {
      const result = await testConn.mutateAsync({ apiUrl: urlCheck.normalized, apiKey });
      if (result.ok) {
        setState({ kind: "passed" });
      } else {
        setState({ kind: "failed", reason: result.message });
      }
    } catch (caught) {
      setState({ kind: "failed", reason: caught instanceof Error ? caught.message : undefined });
    }
  };

  const armOverride = () => setState({ kind: "override-armed" });

  const handleContinue = async () => {
    setState({ kind: "saving" });
    try {
      await update.mutateAsync({ apiUrl: urlCheck.normalized, apiKey });
      onComplete();
    } catch {
      setState({ kind: "save-failed" });
    }
  };

  const isTesting = state.kind === "testing";
  const isSaving = state.kind === "saving";

  const statusStripNode = (() => {
    if (state.kind === "passed") {
      return <StatusStrip tone="success" message={SLSKD_COPY.passed} />;
    }
    if (state.kind === "failed") {
      const message = state.reason ? SLSKD_COPY.failedReason(state.reason) : SLSKD_COPY.failed;
      return (
        <StatusStrip
          tone="error"
          message={message}
          action={
            <button type="button" onClick={armOverride} className={statusStripAction()}>
              {SLSKD_COPY.overrideLink}
            </button>
          }
        />
      );
    }
    if (state.kind === "override-armed") {
      return <StatusStrip tone="neutral" message={SLSKD_COPY.overrideArmed} />;
    }
    return null;
  })();

  const footerError =
    state.kind === "save-failed" ? <StatusStrip tone="error" message={SLSKD_COPY.saveFailed} /> : undefined;

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      headingId={SETUP_HEADING_IDS.slskd}
      title="Connect to slskd"
      description="Synthseek talks to the Soulseek network through your slskd daemon. This step is required."
      primaryLabel={isSaving ? "Saving..." : "Continue"}
      primaryDisabled={!canContinue}
      primaryLoading={isSaving}
      primaryHint={SLSKD_COPY.blockedHint}
      onPrimary={handleContinue}
      showBack={Boolean(onBack)}
      onBack={onBack}
      footerError={footerError}
    >
      <SettingsField label="API URL" htmlFor={apiUrlId}>
        <SettingsTextInput
          id={apiUrlId}
          value={apiUrl}
          onChange={handleUrlChange}
          placeholder="http://localhost:5030"
          type="url"
        />
        {urlError ? (
          <p role="alert" className={fieldError()}>
            {urlError}
          </p>
        ) : urlWarning ? (
          <p className={fieldWarning()}>{urlWarning}</p>
        ) : null}
      </SettingsField>
      <SettingsField label="API Key" htmlFor={apiKeyId}>
        <SettingsSecretInput id={apiKeyId} value={apiKey} onChange={handleKeyChange} />
      </SettingsField>

      <div className={slskdTestRow()}>
        <Button variant="outline" size="sm" onClick={handleTest} disabled={!fieldsFilled || isTesting}>
          <Plug className="size-4" />
          {isTesting ? SLSKD_COPY.testBusy : SLSKD_COPY.testIdle}
        </Button>
      </div>

      {statusStripNode}
    </StepShell>
  );
}
