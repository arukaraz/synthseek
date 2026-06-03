"use client";

import { Plug } from "lucide-react";

import { usePlexConnect } from "@hooks/api/mutations/settings/usePlexConnect";

import { StatusStrip } from "../components/StatusStrip";
import { PLEX_COPY, SETUP_HEADING_IDS } from "../constants";
import { isPlexTimeoutMessage } from "../helpers";
import {
  serverPickerCard,
  serverPickerLocation,
  serverPickerName,
  serverPickerUri,
  wizardPickerButton,
} from "../styles";
import { StepShell } from "./StepShell";
import type { PlexStepProps } from "../types";

export function PlexStep({ stepIndex, totalSteps, onComplete, onBack, onSkip }: PlexStepProps) {
  const plex = usePlexConnect();

  const isDone = plex.state.kind === "done";
  const isPending = plex.state.kind === "pending";
  const isSaving = plex.state.kind === "saving";

  const primaryAction = isDone ? onComplete : plex.start;
  const primaryLabel = isDone
    ? "Continue"
    : isPending
      ? "Waiting for Plex..."
      : isSaving
        ? "Saving..."
        : "Login with Plex";

  const footerError =
    plex.state.kind === "error" ? (
      <StatusStrip
        tone="error"
        message={isPlexTimeoutMessage(plex.state.message) ? PLEX_COPY.timeout : PLEX_COPY.popupUnfinished}
      />
    ) : undefined;

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      headingId={SETUP_HEADING_IDS.plex}
      title="Connect Plex (optional)"
      description="Lets Synthseek scan your library after each import and mirror playlists. You can do this later from Settings."
      primaryLabel={primaryLabel}
      primaryDisabled={isSaving}
      primaryLoading={isPending || isSaving}
      onPrimary={primaryAction}
      secondaryLabel="Skip"
      onSecondary={onSkip}
      showBack
      onBack={onBack}
      footerError={footerError}
    >
      {plex.state.kind === "picking" ? (
        plex.state.servers.length === 0 ? (
          <StatusStrip tone="neutral" message={PLEX_COPY.noServers} />
        ) : (
          <div className={serverPickerCard()}>
            <span className="text-fg/70 text-xs">Pick the Plex server Synthseek should target:</span>
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
                <span className={serverPickerLocation()}>{server.local ? "local" : "remote"}</span>
              </button>
            ))}
          </div>
        )
      ) : isDone ? (
        <StatusStrip tone="success" message={PLEX_COPY.connected} />
      ) : (
        <p className="text-fg/55 flex items-center gap-2 text-sm">
          <Plug className="size-4" /> {PLEX_COPY.intro}
        </p>
      )}
    </StepShell>
  );
}
