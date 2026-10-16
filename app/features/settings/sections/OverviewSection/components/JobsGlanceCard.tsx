"use client";

import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { useJobs } from "@hooks/api/queries/useJobs";

import { JobRow } from "../../../components/JobRow";
import { SettingsCard } from "../../../components/SettingsCard";
import { useSettingsNavigate } from "../../../components/SettingsSaveScope";
import { jobList } from "../../../styles";
import { ALL_JOBS_HREF, OVERVIEW_JOB_LIMIT } from "../constants";
import { jobsAtAGlance } from "../helpers";

export function JobsGlanceCard() {
  const { t } = useTranslation("settings");
  const navigate = useSettingsNavigate();
  const jobs = useJobs();

  return (
    <SettingsCard
      title={t("jobs.card.title")}
      trailing={
        <Button size="sm" variant="ghost" onClick={() => navigate(ALL_JOBS_HREF)}>
          {t("overview.jobs.all")}
          <ChevronRight className="size-4" />
        </Button>
      }
    >
      {jobs.data ? (
        <div className={jobList()}>
          {jobsAtAGlance(jobs.data, OVERVIEW_JOB_LIMIT).map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <span className="text-fg/60 text-sm">{t("jobs.card.loading")}</span>
      )}
    </SettingsCard>
  );
}
