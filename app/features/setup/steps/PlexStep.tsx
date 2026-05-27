"use client";

import { Plug } from "lucide-react";

import { usePlexConnect } from "@hooks/api/mutations/settings/usePlexConnect";

import { wizardPickerButton, wizardPickerCard } from "../styles";
import { StepShell } from "./StepShell";
import type { PlexStepProps } from "../types";

export function PlexStep({ stepIndex, totalSteps, onComplete, onBack, onSkip }: PlexStepProps) {
  const plex = usePlexConnect();

  const primaryAction = plex.state.kind === "done" ? onComplete : plex.start;
  const primaryLabel =
    plex.state.kind === "done"
      ? "Continue"
      : plex.state.kind === "pending"
        ? "Waiting for Plex..."
        : plex.state.kind === "saving"
          ? "Saving..."
          : "Login with Plex";

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      title="Connect Plex (optional)"
      description="Lets Synthseek scan your library after each import and mirror playlists. You can do this later from Settings."
      primaryLabel={primaryLabel}
      primaryDisabled={plex.state.kind === "saving"}
      primaryLoading={plex.state.kind === "pending" || plex.state.kind === "saving"}
      onPrimary={primaryAction}
      secondaryLabel="Skip"
      onSecondary={onSkip}
      showBack
      onBack={onBack}
    >
      {plex.state.kind === "picking" ? (
        <div className={wizardPickerCard()}>
          <span className="text-fg/70 text-xs">Pick the Plex server Synthseek should target:</span>
          {plex.state.servers.length === 0 ? (
            <span className="text-fg/50 text-xs">No Plex servers were found on this account.</span>
          ) : (
            plex.state.servers.map((server) => (
              <button
                key={`${server.clientIdentifier}-${server.uri}`}
                type="button"
                onClick={() => plex.saveServer(server.uri)}
                className={wizardPickerButton()}
              >
                <span className="text-fg text-sm">{server.name}</span>
                <span className="text-fg/40 text-xs">
                  {server.local ? "local" : "remote"} · {server.uri}
                </span>
              </button>
            ))
          )}
        </div>
      ) : plex.state.kind === "done" ? (
        <p className="text-sm text-emerald-300">● Plex connected. Continue to the next step.</p>
      ) : (
        <p className="text-fg/55 flex items-center gap-2 text-sm">
          <Plug className="size-4" /> A popup will open for you to sign in to plex.tv.
        </p>
      )}
    </StepShell>
  );
}
