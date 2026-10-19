"use client";

import { useTranslation } from "react-i18next";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { SETTINGS_PAGE_BY_ID } from "../../constants";
import { contentRoot, sectionGrid } from "../../styles";
import { AnalyticsBoard } from "./components/AnalyticsBoard/AnalyticsBoard";
import { AttentionTiles } from "./components/AttentionTiles";
import { ConnectionsCard } from "./components/ConnectionsCard";
import { JobsGlanceCard } from "./components/JobsGlanceCard";
import { OverviewProblems } from "./components/OverviewProblems";
import { SetupChecklistCard } from "./components/SetupChecklistCard";
import { overviewColumn } from "./styles";

export function OverviewSection() {
  const { t } = useTranslation("settings");
  const page = SETTINGS_PAGE_BY_ID.overview;

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t(page.labelKey)} description={t(page.descriptionKey)} />
      <OverviewProblems />
      <AttentionTiles />
      <div className={sectionGrid()}>
        <ConnectionsCard />
        <div className={overviewColumn()}>
          <SetupChecklistCard />
          <JobsGlanceCard />
        </div>
      </div>
      <AnalyticsBoard />
    </div>
  );
}
