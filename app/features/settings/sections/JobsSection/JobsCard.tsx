"use client";

import { useJobs } from "@hooks/api/queries/useJobs";

import { SettingsCard } from "../../components/SettingsCard";
import { jobList } from "../../styles";
import { JOBS_CARD_DESCRIPTION } from "./constants";
import { JobRow } from "./JobRow";

export function JobsCard() {
  const { data, isLoading, error } = useJobs();

  return (
    <SettingsCard title="Scheduled jobs" description={JOBS_CARD_DESCRIPTION}>
      {isLoading ? (
        <span className="text-fg/60 text-sm">Loading jobs…</span>
      ) : error || !data ? (
        <span className="text-sm text-red-400">Failed to load jobs: {error?.message ?? "Unknown error"}</span>
      ) : (
        <div className={jobList()}>
          {data.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </div>
      )}
    </SettingsCard>
  );
}
