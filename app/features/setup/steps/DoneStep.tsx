"use client";

import { Check } from "lucide-react";
import { useEffect } from "react";

import { useFinishWizard } from "@hooks/api/mutations/settings/useFinishWizard";

import { doneCard, doneCheckBadge } from "../styles";
import { StepShell } from "./StepShell";
import type { DoneStepProps } from "../types";

export function DoneStep({ stepIndex, totalSteps, onFinish }: DoneStepProps) {
  const finish = useFinishWizard();

  useEffect(() => {
    finish.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      title="You're all set"
      description="Synthseek is ready to go. You can adjust everything later under Settings."
      primaryLabel="Go to dashboard"
      primaryLoading={finish.isPending}
      onPrimary={onFinish}
    >
      <div className={doneCard()}>
        <span className={doneCheckBadge()}>
          <Check className="size-5" />
        </span>
        <div className="flex flex-col">
          <span className="text-fg text-sm font-medium">Setup complete</span>
          <span className="text-fg/55 text-xs">
            Slskd is wired up. Plex and metadata enrichment can be added or edited any time.
          </span>
        </div>
      </div>
    </StepShell>
  );
}
