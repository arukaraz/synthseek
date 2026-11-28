"use client";

import { Link2, Loader2, Plug } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import { authPlexButton, authPlexIcon, authPlexWord } from "@components/ui/styles";
import { usePlexConnect } from "@hooks/api/mutations/settings/usePlexConnect";
import { cn } from "@utils/cn";

import { QuestionFrame } from "../components/QuestionFrame";
import { StatusStrip } from "../components/StatusStrip";
import { StepActions } from "../components/StepActions";
import { isPlexTimeoutMessage } from "../helpers";
import { useRecordStep } from "../hooks/useRecordStep";
import {
  plexIntro,
  serverPickerCard,
  serverPickerIntro,
  serverPickerLocation,
  serverPickerName,
  serverPickerUri,
  setupActionIcon,
  setupForm,
  wizardPickerButton,
} from "../styles";
import type { StepProps } from "../types";

export function PlexConnectStep({ onGo }: StepProps) {
  const { t } = useTranslation("setup");
  const plex = usePlexConnect({ silent: true });
  const { record, pending, failure } = useRecordStep("media", onGo);

  const { state } = plex;
  const busy = state.kind === "pending" || state.kind === "saving";
  const phase = state.kind === "error" ? "error" : busy ? "pending" : "idle";

  return (
    <QuestionFrame step="media" focusKey="media-plex" title={t("connect.title", { server: "Plex" })}>
      <div className={setupForm()}>
        {state.kind === "done" ? <StatusStrip tone="success" message={t("plex.connected")} /> : null}
        {state.kind === "picking" && state.servers.length === 0 ? (
          <StatusStrip tone="neutral" message={t("plex.noServers")} />
        ) : null}
        {state.kind === "picking" && state.servers.length > 0 ? (
          <div className={serverPickerCard()}>
            <span className={serverPickerIntro()}>{t("plex.serverPickerIntro")}</span>
            {state.servers.map((server) => (
              <button
                key={`${server.clientIdentifier}-${server.uri}`}
                type="button"
                onClick={() => void plex.saveServer(server.uri)}
                className={wizardPickerButton()}
              >
                <span className="flex min-w-0 flex-col">
                  <span className={serverPickerName()}>{server.name}</span>
                  <span className={serverPickerUri()}>{server.uri}</span>
                </span>
                <span className={serverPickerLocation()}>
                  {server.local ? t("plex.serverLocal") : t("plex.serverRemote")}
                </span>
              </button>
            ))}
          </div>
        ) : null}
        {state.kind === "idle" || state.kind === "pending" || state.kind === "saving" || state.kind === "error" ? (
          <>
            <p className={plexIntro()}>
              <Plug aria-hidden="true" className={setupActionIcon()} />
              {t("plex.intro")}
            </p>
            <button
              type="button"
              onClick={() => void plex.start()}
              disabled={busy}
              aria-busy={busy || undefined}
              data-error={state.kind === "error"}
              className={authPlexButton({ phase })}
            >
              {busy ? (
                <Loader2
                  aria-hidden="true"
                  className={cn(authPlexIcon({ phase }), "animate-spin motion-reduce:animate-none")}
                />
              ) : (
                <Link2 aria-hidden="true" className={authPlexIcon({ phase })} />
              )}
              {busy ? (
                state.kind === "pending" ? (
                  t("plex.connecting")
                ) : (
                  t("plex.saving")
                )
              ) : (
                <span>
                  <Trans i18nKey="plex.connect" t={t} components={[<span key="word" className={authPlexWord()} />]} />
                </span>
              )}
            </button>
          </>
        ) : null}
        {state.kind === "error" ? (
          <StatusStrip
            tone="error"
            message={isPlexTimeoutMessage(state.message) ? t("plex.timeout") : t("plex.popupUnfinished")}
          />
        ) : null}
        {failure ? <StatusStrip tone="error" message={failure} /> : null}
        <StepActions
          onBack={() => onGo("media")}
          forwardLabel={t("actions.continue")}
          forwardBusy={pending}
          forwardDisabled={state.kind !== "done"}
          onForward={() => void record("answered", "downloads")}
          onSkip={() => void record("skipped", "downloads")}
        />
      </div>
    </QuestionFrame>
  );
}
