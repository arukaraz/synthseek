"use client";

import { Loader2, Play } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LoadingDots } from "@components/ui/LoadingDots";
import { useTriggerJob } from "@hooks/api/mutations/jobs/useTriggerJob";
import { useNow } from "@hooks/ui/useNow";

import { JOB_DESCRIPTION_KEYS, JOB_NAME_KEYS } from "./constants";
import {
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
  jobRight,
  jobRow,
} from "../../styles";
import { describeInterval, formatNextRun } from "./helpers";
import type { JobRowProps } from "./types";

export function JobRow({ job }: JobRowProps) {
  const { t } = useTranslation("settings");
  const trigger = useTriggerJob();
  const now = useNow();
  const isRunning = job.running || trigger.isPending;
  const lastRunFailed = job.lastStatus === "failed";
  const nextRun = formatNextRun(job.nextRun, now);
  const name = t(JOB_NAME_KEYS[job.id]);

  return (
    <div className={jobRow()}>
      <div className={jobInfo()}>
        <span className={jobName()}>{name}</span>
        <span className={jobDescription()}>{t(JOB_DESCRIPTION_KEYS[job.id])}</span>
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
        <button
          type="button"
          className={jobPlayButton()}
          onClick={() => trigger.mutate({ id: job.id })}
          disabled={isRunning}
          aria-label={isRunning ? t("jobs.row.running", { name }) : t("jobs.row.runNow", { name })}
          aria-busy={isRunning}
        >
          {isRunning ? <Loader2 className="animate-spin" /> : <Play className="fill-current" />}
        </button>
      </div>
    </div>
  );
}
