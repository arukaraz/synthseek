"use client";

import { Link2, Loader2, Plug } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import { authPlexButton, authPlexIcon, authPlexWord } from "@components/ui/styles";
import { usePlexConnect } from "@hooks/api/mutations/settings/usePlexConnect";
import { cn } from "@utils/cn";

import { StatusStrip } from "../components/StatusStrip";
import { SETUP_HEADING_IDS } from "../constants";
import { isPlexTimeoutMessage } from "../helpers";
import {
  plexIntro,
  serverPickerCard,
  serverPickerIntro,
  serverPickerLocation,
  serverPickerName,
  serverPickerUri,
  wizardPickerButton,
} from "../styles";
import { StepShell } from "./StepShell";
import type { PlexStepProps } from "../types";

export function PlexStep({ stepIndex, totalSteps, onComplete, onBack, onSkip }: PlexStepProps) {
  const { t } = useTranslation("setup");
  const plex = usePlexConnect();

  const isDone = plex.state.kind === "done";
  const isPending = plex.state.kind === "pending";
  const isSaving = plex.state.kind === "saving";
  const connectBusy = isPending || isSaving;

  const connectLabel = isPending ? t("plex.connecting") : t("plex.saving");
  const connectPhase = plex.state.kind === "error" ? "error" : connectBusy ? "pending" : "idle";

  const footerError =
    plex.state.kind === "error" ? (
      <StatusStrip
        tone="error"
        message={isPlexTimeoutMessage(plex.state.message) ? t("plex.timeout") : t("plex.popupUnfinished")}
      />
    ) : undefined;

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      headingId={SETUP_HEADING_IDS.plex}
      title={t("plex.title")}
      description={t("plex.description")}
      primaryLabel={t("actions.continue")}
      primaryDisabled={!isDone}
      primaryHint={t("plex.blockedHint")}
      onPrimary={onComplete}
      secondaryLabel={t("actions.skip")}
      onSecondary={onSkip}
      showBack
      onBack={onBack}
      footerError={footerError}
    >
      {plex.state.kind === "done" ? (
        <StatusStrip tone="success" message={t("plex.connected")} />
      ) : plex.state.kind === "picking" ? (
        plex.state.servers.length === 0 ? (
          <StatusStrip tone="neutral" message={t("plex.noServers")} />
        ) : (
          <div className={serverPickerCard()}>
            <span className={serverPickerIntro()}>{t("plex.serverPickerIntro")}</span>
            {plex.state.servers.map((server) => (
              <button
                key={`${server.clientIdentifier}-${server.uri}`}
                type="button"
                onClick={() => plex.saveServer(server.uri)}
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
        )
      ) : (
        <>
          <p className={plexIntro()}>
            <Plug className="size-4 shrink-0" aria-hidden="true" /> {t("plex.intro")}
          </p>
          <button
            type="button"
            onClick={plex.start}
            disabled={connectBusy}
            aria-busy={connectBusy || undefined}
            data-error={plex.state.kind === "error"}
            className={authPlexButton({ phase: connectPhase })}
          >
            {connectBusy ? (
              <Loader2 className={cn(authPlexIcon({ phase: connectPhase }), "animate-spin")} aria-hidden="true" />
            ) : (
              <Link2 className={authPlexIcon({ phase: connectPhase })} aria-hidden="true" />
            )}
            {connectBusy ? (
              connectLabel
            ) : (
              <span>
                <Trans i18nKey="plex.connect" t={t} components={[<span key="word" className={authPlexWord()} />]} />
              </span>
            )}
          </button>
        </>
      )}
    </StepShell>
  );
}
