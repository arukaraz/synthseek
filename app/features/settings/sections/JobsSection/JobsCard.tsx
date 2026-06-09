"use client";

import { useTranslation } from "react-i18next";

import { useJobs } from "@hooks/api/queries/useJobs";

import { SettingsCard } from "../../components/SettingsCard";
import { jobList } from "../../styles";
import { JobRow } from "./JobRow";

export function JobsCard() {
  const { t } = useTranslation("settings");
  const { data, isLoading, error } = useJobs();

  return (
    <SettingsCard title={t("jobs.card.title")} description={t("jobs.card.description")}>
      {isLoading ? (
        <span className="text-fg/60 text-sm">{t("jobs.card.loading")}</span>
      ) : error || !data ? (
        <span className="text-sm text-red-400">
          {t("jobs.card.loadError", { message: error?.message ?? t("jobs.card.unknownError") })}
        </span>
      ) : (
        <div className={jobList()}>
          {data
            .filter((job) => job.id !== "pattern-sync")
            .map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
        </div>
      )}
    </SettingsCard>
  );
}
