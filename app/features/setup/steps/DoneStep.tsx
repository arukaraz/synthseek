"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useFinishWizard } from "@hooks/api/mutations/settings/useFinishWizard";

import { StatusStrip } from "../components/StatusStrip";
import { SETUP_HEADING_IDS } from "../constants";
import { doneCard, doneCardBody, doneCardHeading, doneCheckBadge } from "../styles";
import { StepShell } from "./StepShell";
import type { DoneState, DoneStepProps } from "../types";

export function DoneStep({ stepIndex, totalSteps, onFinish }: DoneStepProps) {
  const { t } = useTranslation("setup");
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
    ? t("done.primaryBusy")
    : hasFailed
      ? t("done.primaryRetry")
      : t("done.primaryRest");

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      headingId={SETUP_HEADING_IDS.done}
      title={t("done.title")}
      description={t("done.description")}
      primaryLabel={primaryLabel}
      primaryLoading={isCompleting}
      onPrimary={handleFinish}
      footerError={hasFailed ? <StatusStrip tone="error" message={t("done.failed")} /> : undefined}
    >
      <div className={doneCard({ deemphasized: hasFailed })}>
        <span className={doneCheckBadge()}>
          <Check className="size-5" />
        </span>
        <div className="flex flex-col">
          <span className={doneCardHeading()}>{t("done.cardHeading")}</span>
          <span className={doneCardBody()}>{t("done.cardBody")}</span>
        </div>
      </div>
    </StepShell>
  );
}
