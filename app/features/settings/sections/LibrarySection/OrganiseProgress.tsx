"use client";

import { Square } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Notice } from "@components/ui/Notice";
import { ProgressBar } from "@components/ui/ProgressBar";
import { useCancelLibraryOrganise } from "@hooks/api/mutations/library/useLibraryOrganiseControls";
import { formatElapsed } from "@utils/formatters";

import { percentDone, runOutcome, secondsRemaining } from "./helpers";
import { progressBottom, progressCounts, progressPercent, progressTop, progressWrap } from "./styles";
import type { OrganiseProgressProps } from "./types";

export function OrganiseProgress({ status }: OrganiseProgressProps) {
  const { t } = useTranslation("settings");
  const cancel = useCancelLibraryOrganise();
  const outcome = runOutcome(status);
  const left = secondsRemaining(status, Date.now());
  const percent = percentDone(status.processed, status.total);

  if (status.running) {
    return (
      <div className={progressWrap()}>
        <div className={progressTop()}>
          <span className={progressPercent()}>{percent}%</span>
          <span className={progressCounts()}>
            {t("libraryOrganise.progressCounts", {
              processed: status.processed.toLocaleString(),
              total: status.total.toLocaleString(),
            })}
          </span>
        </div>
        <ProgressBar progress={percent} isActive size="lg" />
        <div className={progressBottom()}>
          <span className={progressCounts()}>
            {left === null
              ? t("libraryOrganise.estimating")
              : t("libraryOrganise.timeLeft", { time: formatElapsed(left) })}
          </span>
          <Button variant="secondary" size="sm" onClick={() => cancel.mutate()} disabled={status.cancelling}>
            <Square className="size-4" />
            {status.cancelling ? t("libraryOrganise.actions.stopping") : t("libraryOrganise.actions.stop")}
          </Button>
        </div>
      </div>
    );
  }

  if (outcome === null) return null;

  return (
    <Notice
      variant={outcome.failed > 0 || outcome.companionsFailed > 0 ? "warning" : "success"}
      title={t("libraryOrganise.finished", {
        count: outcome.moved,
        formatted: outcome.moved.toLocaleString(),
        duration: outcome.duration,
      })}
    >
      {outcome.companionsMoved > 0 ? (
        <p>
          {t("libraryOrganise.finishedCompanions", {
            count: outcome.companionsMoved,
            formatted: outcome.companionsMoved.toLocaleString(),
          })}
        </p>
      ) : null}
      {outcome.failed > 0 ? <p>{t("libraryOrganise.finishedFailures", { count: outcome.failed })}</p> : null}
      {outcome.companionsFailed > 0 ? (
        <p>{t("libraryOrganise.finishedCompanionsFailed", { count: outcome.companionsFailed })}</p>
      ) : null}
    </Notice>
  );
}
