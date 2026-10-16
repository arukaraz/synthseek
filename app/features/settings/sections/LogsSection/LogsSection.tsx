"use client";

import { LogExportCard } from "./LogExportCard";
import { LogLevelCard } from "./LogLevelCard";
import { LogViewerCard } from "./LogViewerCard";

export function LogsSection() {
  return (
    <>
      <LogLevelCard />
      <LogViewerCard />
      <LogExportCard />
    </>
  );
}
