"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { useFinishWizard } from "@hooks/api/mutations/settings/useFinishWizard";

import { StatusStrip } from "../components/StatusStrip";
import { DONE_COPY, SETUP_HEADING_IDS } from "../constants";
import { doneCard, doneCheckBadge } from "../styles";
import { StepShell } from "./StepShell";
import type { DoneState, DoneStepProps } from "../types";

export function DoneStep({ stepIndex, totalSteps, onFinish }: DoneStepProps) {
  const finish = useFinishWizard();
  const [state, setState] = useState<DoneState>({ kind: "resting" });

  const handleFinish = async () => {
    setState({ kind: "completing" });
    try {
      await finish.mutateAsync();
      onFinish();
    } catch {
      setState({ kind: "failed" });
    }
  };

  const isCompleting = state.kind === "completing";
  const hasFailed = state.kind === "failed";

  const primaryLabel = isCompleting
    ? DONE_COPY.primaryBusy
    : hasFailed
      ? DONE_COPY.primaryRetry
      : DONE_COPY.primaryRest;

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      headingId={SETUP_HEADING_IDS.done}
      title={DONE_COPY.title}
      description={DONE_COPY.description}
      primaryLabel={primaryLabel}
      primaryLoading={isCompleting}
      onPrimary={handleFinish}
      footerError={hasFailed ? <StatusStrip tone="error" message={DONE_COPY.failed} /> : undefined}
    >
      <div className={doneCard({ deemphasized: hasFailed })}>
        <span className={doneCheckBadge()}>
          <Check className="size-5" />
        </span>
        <div className="flex flex-col">
          <span className="text-fg text-sm font-medium">{DONE_COPY.cardHeading}</span>
          <span className="text-fg/55 text-xs">{DONE_COPY.cardBody}</span>
        </div>
      </div>
    </StepShell>
  );
}
