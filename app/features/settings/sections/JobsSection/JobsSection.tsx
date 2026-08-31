"use client";

import { useTranslation } from "react-i18next";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { contentRoot } from "../../styles";
import { JobsCard } from "./JobsCard";
import { LibraryScanCard } from "./LibraryScanCard";

export function JobsSection() {
  const { t } = useTranslation("settings");

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t("jobs.page.title")} description={t("jobs.page.description")} />
      <JobsCard />
      <LibraryScanCard />
    </div>
  );
}
