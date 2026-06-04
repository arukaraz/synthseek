"use client";

import { Plug, Server } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { PasswordField } from "@components/ui/PasswordField";
import { authInputControl, authInputIcon, authInputRow } from "@components/ui/styles";
import { useTestSlskd, useUpdateConnectionsSlskd } from "@hooks/api/mutations/settings/useUpdateConnections";
import { validateSlskdApiUrl } from "@utils/slskd-url";

import { StatusStrip } from "../components/StatusStrip";
import { SETUP_HEADING_IDS } from "../constants";
import {
  fieldError,
  fieldGroup,
  fieldLabel,
  fieldWarning,
  slskdTestButton,
  slskdTestRow,
  statusStripAction,
} from "../styles";
import { StepShell } from "./StepShell";
import type { SlskdConnectState, SlskdStepProps } from "../types";

export function SlskdStep({ stepIndex, totalSteps, onComplete, onBack }: SlskdStepProps) {
  const { t } = useTranslation("setup");
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
      return <StatusStrip tone="success" message={t("slskd.passed")} />;
    }
    if (state.kind === "failed") {
      const message = state.reason ? t("slskd.failedReason", { reason: state.reason }) : t("slskd.failed");
      return (
        <StatusStrip
          tone="error"
          message={message}
          action={
            <button type="button" onClick={armOverride} className={statusStripAction()}>
              {t("slskd.overrideLink")}
            </button>
          }
        />
      );
    }
    if (state.kind === "override-armed") {
      return <StatusStrip tone="neutral" message={t("slskd.overrideArmed")} />;
    }
    return null;
  })();

  const footerError =
    state.kind === "save-failed" ? <StatusStrip tone="error" message={t("slskd.saveFailed")} /> : undefined;

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      headingId={SETUP_HEADING_IDS.slskd}
      title={t("slskd.title")}
      description={t("slskd.description")}
      primaryLabel={isSaving ? t("actions.saving") : t("actions.continue")}
      primaryDisabled={!canContinue}
      primaryLoading={isSaving}
      primaryHint={t("slskd.blockedHint")}
      onPrimary={handleContinue}
      showBack={Boolean(onBack)}
      onBack={onBack}
      footerError={footerError}
    >
      <div className={fieldGroup()}>
        <label htmlFor={apiUrlId} className={fieldLabel()}>
          {t("slskd.apiUrlLabel")}
        </label>
        <div className={authInputRow({ invalid: Boolean(urlError) })}>
          <Server className={authInputIcon()} aria-hidden="true" />
          <input
            id={apiUrlId}
            type="url"
            value={apiUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder={t("slskd.apiUrlPlaceholder")}
            aria-invalid={Boolean(urlError) || undefined}
            className={authInputControl()}
          />
        </div>
        {urlError ? (
          <p role="alert" className={fieldError()}>
            {urlError}
          </p>
        ) : urlWarning ? (
          <p className={fieldWarning()}>{urlWarning}</p>
        ) : null}
      </div>

      <PasswordField
        id={apiKeyId}
        value={apiKey}
        onChange={handleKeyChange}
        label={t("slskd.apiKeyLabel")}
        autoComplete="off"
      />

      <div className={slskdTestRow()}>
        <button type="button" onClick={handleTest} disabled={!fieldsFilled || isTesting} className={slskdTestButton()}>
          <Plug className="size-4" aria-hidden="true" />
          {isTesting ? t("slskd.testBusy") : t("slskd.testIdle")}
        </button>
      </div>

      {statusStripNode}
    </StepShell>
  );
}
