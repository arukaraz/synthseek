"use client";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { contentRoot } from "../../styles";
import { JOBS_DESCRIPTION } from "./constants";
import { JobsCard } from "./JobsCard";

export function JobsSection() {
  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title="Jobs" description={JOBS_DESCRIPTION} />
      <JobsCard />
    </div>
  );
}
