"use client";

import { Server } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { PasswordField } from "@components/ui/PasswordField";
import { useTestSlskd, useUpdateConnectionsSlskd } from "@hooks/api/mutations/settings/useUpdateConnections";
import { useSettings } from "@hooks/api/queries/useSettings";
import { validateSlskdApiUrl } from "@utils/slskd-url";

import { ConnectionStatus } from "../components/ConnectionStatus";
import { FieldNote } from "../components/FieldNote";
import { QuestionFrame } from "../components/QuestionFrame";
import { StatusStrip } from "../components/StatusStrip";
import { StepActions } from "../components/StepActions";
import { TestButton } from "../components/TestButton";
import { TextField } from "../components/TextField";
import { useConnectionCheck } from "../hooks/useConnectionCheck";
import { useRecordStep } from "../hooks/useRecordStep";
import { fieldGroup, setupColumn, setupForm } from "../styles";
import type { StepProps } from "../types";

export function DownloadsStep({ onGo }: StepProps) {
  const { t } = useTranslation("setup");
  const saved = useSettings().data?.connections.slskd;
  const update = useUpdateConnectionsSlskd({ silent: true });
  const test = useTestSlskd();
  const connection = useConnectionCheck();
  const { record, pending, failure, clearFailure } = useRecordStep("downloads", onGo);
  const keyId = useId();
  const keyNoteId = useId();
  const [edited, setEdited] = useState<{ apiUrl?: string; apiKey?: string }>({});
  const [saveFailed, setSaveFailed] = useState(false);

  const apiUrl = edited.apiUrl ?? saved?.apiUrl ?? "";
  const apiKey = edited.apiKey ?? saved?.apiKey ?? "";
  const urlCheck = validateSlskdApiUrl(apiUrl);
  const urlInvalid = apiUrl.length > 0 && !urlCheck.ok;
  const complete = urlCheck.ok && apiKey.length > 0;
  const verified = connection.state.kind === "passed" || connection.state.kind === "override";

  const change = (field: "apiUrl" | "apiKey") => (value: string) => {
    setEdited((previous) => ({ ...previous, [field]: value }));
    setSaveFailed(false);
    clearFailure();
    connection.reset();
  };

  const handleTest = () =>
    connection.check(async () => {
      const result = await test.mutateAsync({ apiUrl: urlCheck.normalized, apiKey });
      if (result.ok) return { kind: "passed" };
      return {
        kind: "failed",
        reason: result.message ? t("downloads.failedReason", { reason: result.message }) : undefined,
      };
    });

  const handleContinue = async () => {
    setSaveFailed(false);
    try {
      await update.mutateAsync({ apiUrl: urlCheck.normalized, apiKey, bannedUsers: saved?.bannedUsers });
    } catch {
      setSaveFailed(true);
      return;
    }
    await record("answered", "metadata");
  };

  return (
    <QuestionFrame
      step="downloads"
      focusKey="downloads"
      title={t("downloads.title")}
      description={t("downloads.description")}
    >
      <div className={setupForm()}>
        <div className={setupColumn()}>
          <TextField
            label={t("downloads.apiUrlLabel")}
            value={apiUrl}
            onChange={change("apiUrl")}
            icon={Server}
            type="url"
            autoComplete="off"
            placeholder={t("downloads.apiUrlPlaceholder")}
            error={urlInvalid ? t("connect.urlError") : null}
          />
          <div className={fieldGroup()}>
            <PasswordField
              id={keyId}
              value={apiKey}
              onChange={change("apiKey")}
              label={t("downloads.apiKeyLabel")}
              autoComplete="off"
              describedBy={keyNoteId}
            />
            {apiKey.length === 0 ? (
              <FieldNote id={keyNoteId} tone="hint">
                {t("downloads.apiKeyHint")}
              </FieldNote>
            ) : null}
          </div>
        </div>
        <TestButton
          testing={connection.state.kind === "testing"}
          disabled={!complete}
          idleLabel={t("downloads.testIdle")}
          busyLabel={t("downloads.testBusy")}
          onTest={() => void handleTest()}
        />
        <ConnectionStatus
          state={connection.state}
          passedText={t("downloads.passed")}
          failedText={t("downloads.failed")}
          override={{
            label: t("downloads.overrideLink"),
            armedText: t("downloads.overrideArmed"),
            onArm: connection.override,
          }}
        />
        {saveFailed ? <StatusStrip tone="error" message={t("downloads.saveFailed")} /> : null}
        {failure ? <StatusStrip tone="error" message={failure} /> : null}
        <StepActions
          onBack={() => onGo("media")}
          forwardLabel={t("actions.continue")}
          forwardBusy={pending || update.isPending}
          forwardDisabled={!complete || !verified}
          onForward={() => void handleContinue()}
          onSkip={() => void record("skipped", "metadata")}
        />
      </div>
    </QuestionFrame>
  );
}
