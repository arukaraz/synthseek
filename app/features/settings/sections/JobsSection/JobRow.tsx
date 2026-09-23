"use client";

import { Loader2, Play, Square } from "lucide-react";
import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { LoadingDots } from "@components/ui/LoadingDots";
import { LoadingRing } from "@components/ui/LoadingRing";
import { useStopJob } from "@hooks/api/mutations/jobs/useStopJob";
import { useTriggerJob } from "@hooks/api/mutations/jobs/useTriggerJob";
import { useNow } from "@hooks/ui/useNow";

import { JOB_DESCRIPTION_KEYS, JOB_NAME_KEYS } from "./constants";
import {
  jobAction,
  jobDescription,
  jobInfo,
  jobInProgress,
  jobLastRunFailed,
  jobName,
  jobNextRun,
  jobNextRunLabel,
  jobNextRunUnit,
  jobNextRunValue,
  jobPlayButton,
  jobProgress,
  jobRight,
  jobRow,
  jobSkipped,
} from "../../styles";
import { describeInterval, formatNextRun } from "./helpers";
import type { JobRowProps } from "./types";

export function JobRow({ job }: JobRowProps) {
  const { t } = useTranslation("settings");
  const trigger = useTriggerJob();
  const stop = useStopJob();
  const now = useNow();
  const isRunning = job.running || trigger.isPending;
  const stoppable = isRunning && job.canStop;
  const lastRunFailed = job.lastStatus === "failed";
  const nextRun = formatNextRun(job.nextRun, now);
  const name = t(JOB_NAME_KEYS[job.id]);

  return (
    <div className={jobRow()}>
      <div className={jobInfo()}>
        <span className={jobName()}>{name}</span>
        <span className={jobDescription()}>{t(JOB_DESCRIPTION_KEYS[job.id])}</span>
        {job.progress ? (
          <span className={jobProgress()}>
            {t("jobs.row.progress", {
              done: job.progress.done.toLocaleString(),
              total: job.progress.total.toLocaleString(),
            })}
            {job.progress.skipped > 0 ? (
              <span className={jobSkipped()}>
                {t("jobs.row.skipped", {
                  count: job.progress.skipped,
                  value: job.progress.skipped.toLocaleString(),
                })}
                <InfoTooltip
                  title={t("jobs.row.skippedTooltipTitle")}
                  description={t("jobs.row.skippedTooltipWhat")}
                  secondary={t("jobs.row.skippedTooltipRetry")}
                  triggerLabel={t("jobs.row.skippedTooltipTriggerLabel")}
                />
              </span>
            ) : null}
          </span>
        ) : null}
      </div>
      <div className={jobRight()}>
        <div className={jobNextRun()}>
          <span className={jobNextRunLabel()}>{describeInterval(job.intervalMs)}</span>
          {isRunning ? (
            <span className={jobInProgress()}>
              {t("jobs.row.inProgress")}
              <LoadingDots size="sm" />
            </span>
          ) : lastRunFailed ? (
            <span className={jobLastRunFailed()}>{t("jobs.row.lastRunFailed")}</span>
          ) : (
            <span className={jobNextRunValue()}>
              {nextRun.value}
              {nextRun.unit ? <span className={jobNextRunUnit()}>{nextRun.unit}</span> : null}
            </span>
          )}
        </div>
        <span className={jobAction()}>
          {stoppable ? <LoadingRing className="text-primary-400/60" /> : null}
          <button
            type="button"
            className={jobPlayButton({ intent: stoppable ? "stop" : "run" })}
            onClick={() => (stoppable ? stop.mutate({ id: job.id }) : trigger.mutate({ id: job.id }))}
            disabled={stoppable ? stop.isPending : isRunning}
            aria-label={
              stoppable
                ? t("jobs.row.stop", { name })
                : isRunning
                  ? t("jobs.row.running", { name })
                  : t("jobs.row.runNow", { name })
            }
            aria-busy={isRunning && !stoppable}
          >
            {stoppable ? (
              <Square className="fill-current" />
            ) : isRunning ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Play className="fill-current" />
            )}
          </button>
        </span>
      </div>
    </div>
  );
}
