"use client";

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { authForwardButton, authQuietButton } from "@components/ui/styles";
import { cn } from "@utils/cn";

import { setupActionIcon, setupActions } from "../styles";
import type { StepActionsProps } from "../types";

export function StepActions({
  onBack,
  onSkip,
  forwardLabel,
  forwardBusy = false,
  forwardDisabled = false,
  onForward,
  forwardType = "button",
}: StepActionsProps) {
  const { t } = useTranslation("setup");

  return (
    <div className={setupActions()}>
      {onBack ? (
        <button type="button" onClick={onBack} disabled={forwardBusy} className={cn(authQuietButton(), "gap-2")}>
          <ArrowLeft aria-hidden="true" className={setupActionIcon()} />
          {t("actions.back")}
        </button>
      ) : null}
      <button
        type={forwardType}
        onClick={onForward}
        disabled={forwardDisabled || forwardBusy}
        aria-busy={forwardBusy || undefined}
        className={authForwardButton({ blocked: forwardDisabled && !forwardBusy })}
      >
        {forwardLabel}
        {forwardBusy ? (
          <Loader2 aria-hidden="true" className={cn(setupActionIcon(), "animate-spin motion-reduce:animate-none")} />
        ) : (
          <ArrowRight aria-hidden="true" className={setupActionIcon()} />
        )}
      </button>
      {onSkip ? (
        <button type="button" onClick={onSkip} disabled={forwardBusy} className={authQuietButton()}>
          {t("actions.skip")}
        </button>
      ) : null}
    </div>
  );
}
