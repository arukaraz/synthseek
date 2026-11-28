"use client";

import { Server, User } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { PasswordField } from "@components/ui/PasswordField";
import { useTestNavidrome, useUpdateConnectionsNavidrome } from "@hooks/api/mutations/settings/useUpdateConnections";
import { useSettings } from "@hooks/api/queries/useSettings";
import { PLAYBACK_SERVER_NAMES } from "@utils/playback-servers";

import { ConnectionStatus } from "../components/ConnectionStatus";
import { QuestionFrame } from "../components/QuestionFrame";
import { StatusStrip } from "../components/StatusStrip";
import { StepActions } from "../components/StepActions";
import { TestButton } from "../components/TestButton";
import { TextField } from "../components/TextField";
import { connectionStateOf, isHttpUrl } from "../helpers";
import { useConnectionCheck } from "../hooks/useConnectionCheck";
import { useRecordStep } from "../hooks/useRecordStep";
import { setupColumn, setupForm } from "../styles";
import type { StepProps } from "../types";

export function NavidromeConnectStep({ onGo }: StepProps) {
  const { t } = useTranslation("setup");
  const serverName = PLAYBACK_SERVER_NAMES.navidrome;
  const saved = useSettings().data?.connections.navidrome;
  const update = useUpdateConnectionsNavidrome({ silent: true });
  const test = useTestNavidrome();
  const connection = useConnectionCheck();
  const { record, pending, failure, clearFailure } = useRecordStep("media", onGo);
  const passwordId = useId();
  const [edited, setEdited] = useState<{ url?: string; username?: string; password?: string }>({});
  const [saveFailed, setSaveFailed] = useState(false);

  const url = edited.url ?? saved?.url ?? "";
  const username = edited.username ?? saved?.username ?? "";
  const password = edited.password ?? saved?.password ?? "";
  const urlInvalid = url.length > 0 && !isHttpUrl(url);
  const complete = isHttpUrl(url) && username.trim().length > 0 && password.length > 0;

  const change = (field: "url" | "username" | "password") => (value: string) => {
    setEdited((previous) => ({ ...previous, [field]: value }));
    setSaveFailed(false);
    clearFailure();
    connection.reset();
  };

  const handleTest = () =>
    connection.check(async () => {
      const result = await test.mutateAsync({ url: url.trim(), username: username.trim(), password });
      return connectionStateOf(result.outcome, serverName);
    });

  const handleContinue = async () => {
    setSaveFailed(false);
    try {
      await update.mutateAsync({
        url: url.trim(),
        username: username.trim(),
        password,
        playlistSync: saved?.playlistSync,
      });
    } catch {
      setSaveFailed(true);
      return;
    }
    await record("answered", "downloads");
  };

  return (
    <QuestionFrame step="media" focusKey="media-navidrome" title={t("connect.title", { server: serverName })}>
      <div className={setupForm()}>
        <div className={setupColumn()}>
          <TextField
            label={t("connect.urlLabel", { server: serverName })}
            value={url}
            onChange={change("url")}
            icon={Server}
            type="url"
            autoComplete="off"
            placeholder={t("connect.navidromeUrlPlaceholder")}
            error={urlInvalid ? t("connect.urlError") : null}
          />
          <TextField
            label={t("connect.usernameLabel")}
            value={username}
            onChange={change("username")}
            icon={User}
            autoComplete="off"
          />
          <PasswordField
            id={passwordId}
            value={password}
            onChange={change("password")}
            label={t("connect.passwordLabel")}
            autoComplete="off"
          />
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
