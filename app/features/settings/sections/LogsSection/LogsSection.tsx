"use client";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { contentRoot } from "../../styles";
import { LOGS_DESCRIPTION } from "./constants";
import { LogExportCard } from "./LogExportCard";
import { LogLevelCard } from "./LogLevelCard";
import { LogViewerCard } from "./LogViewerCard";

export function LogsSection() {
  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title="Logs" description={LOGS_DESCRIPTION} />
      <LogLevelCard />
      <LogViewerCard />
      <LogExportCard />
    </div>
  );
}
