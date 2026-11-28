"use client";

import { Server } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { PasswordField } from "@components/ui/PasswordField";
import { useTestJellyfin, useUpdateConnectionsJellyfin } from "@hooks/api/mutations/settings/useUpdateConnections";
import { useSettings } from "@hooks/api/queries/useSettings";
import { PLAYBACK_SERVER_NAMES } from "@utils/playback-servers";

import { ConnectionStatus } from "../components/ConnectionStatus";
import { FieldNote } from "../components/FieldNote";
import { QuestionFrame } from "../components/QuestionFrame";
import { StatusStrip } from "../components/StatusStrip";
import { StepActions } from "../components/StepActions";
import { TestButton } from "../components/TestButton";
import { TextField } from "../components/TextField";
import { connectionStateOf, isHttpUrl } from "../helpers";
import { useConnectionCheck } from "../hooks/useConnectionCheck";
import { useRecordStep } from "../hooks/useRecordStep";
import { fieldGroup, setupColumn, setupForm } from "../styles";
import type { StepProps } from "../types";

export function JellyfinConnectStep({ onGo }: StepProps) {
  const { t } = useTranslation("setup");
  const serverName = PLAYBACK_SERVER_NAMES.jellyfin;
  const saved = useSettings().data?.connections.jellyfin;
  const update = useUpdateConnectionsJellyfin({ silent: true });
  const test = useTestJellyfin();
  const connection = useConnectionCheck();
  const { record, pending, failure, clearFailure } = useRecordStep("media", onGo);
  const keyId = useId();
  const keyNoteId = useId();
  const [edited, setEdited] = useState<{ url?: string; apiKey?: string }>({});
  const [saveFailed, setSaveFailed] = useState(false);

  const url = edited.url ?? saved?.url ?? "";
  const apiKey = edited.apiKey ?? saved?.apiKey ?? "";
  const urlInvalid = url.length > 0 && !isHttpUrl(url);
  const complete = isHttpUrl(url) && apiKey.length > 0;

  const change = (field: "url" | "apiKey") => (value: string) => {
    setEdited((previous) => ({ ...previous, [field]: value }));
    setSaveFailed(false);
    clearFailure();
    connection.reset();
  };

  const handleTest = () =>
    connection.check(async () => {
      const result = await test.mutateAsync({ url: url.trim(), apiKey });
      return connectionStateOf(result.outcome, serverName);
    });

  const handleContinue = async () => {
    setSaveFailed(false);
    try {
      await update.mutateAsync({ url: url.trim(), apiKey, playlistSync: saved?.playlistSync });
    } catch {
      setSaveFailed(true);
      return;
    }
    await record("answered", "downloads");
  };

  return (
    <QuestionFrame step="media" focusKey="media-jellyfin" title={t("connect.title", { server: serverName })}>
      <div className={setupForm()}>
        <div className={setupColumn()}>
          <TextField
            label={t("connect.urlLabel", { server: serverName })}
            value={url}
            onChange={change("url")}
            icon={Server}
            type="url"
            autoComplete="off"
            placeholder={t("connect.jellyfinUrlPlaceholder")}
            error={urlInvalid ? t("connect.urlError") : null}
          />
          <div className={fieldGroup()}>
            <PasswordField
              id={keyId}
              value={apiKey}
              onChange={change("apiKey")}
              label={t("connect.apiKeyLabel")}
              autoComplete="off"
              describedBy={keyNoteId}
            />
            <FieldNote id={keyNoteId} tone="hint">
              {t("connect.apiKeyHint")}
            </FieldNote>
          </div>
        </div>
        <TestButton
          testing={connection.state.kind === "testing"}
          disabled={!complete}
          idleLabel={t("connect.test")}
          busyLabel={t("connect.testing")}
          onTest={() => void handleTest()}
        />
        <ConnectionStatus
          state={connection.state}
          passedText={t("connect.passed", { server: serverName })}
          failedText={t("connect.unreachable", { server: serverName })}
        />
        {saveFailed ? <StatusStrip tone="error" message={t("connect.saveFailed", { server: serverName })} /> : null}
        {failure ? <StatusStrip tone="error" message={failure} /> : null}
        <StepActions
          onBack={() => onGo("media")}
          forwardLabel={t("actions.continue")}
          forwardBusy={pending || update.isPending}
          forwardDisabled={connection.state.kind !== "passed"}
          onForward={() => void handleContinue()}
          onSkip={() => void record("skipped", "downloads")}
        />
      </div>
    </QuestionFrame>
  );
}
