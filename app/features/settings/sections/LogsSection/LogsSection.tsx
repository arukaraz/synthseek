"use client";

import { useTranslation } from "react-i18next";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { contentRoot } from "../../styles";
import { LogExportCard } from "./LogExportCard";
import { LogLevelCard } from "./LogLevelCard";
import { LogViewerCard } from "./LogViewerCard";

export function LogsSection() {
  const { t } = useTranslation("settings");

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t("logs.page.title")} description={t("logs.page.description")} />
      <LogLevelCard />
      <LogViewerCard />
      <LogExportCard />
    </div>
  );
}
