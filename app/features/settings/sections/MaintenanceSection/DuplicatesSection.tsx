"use client";

import { DuplicatesContent } from "@features/settings/sections/JobsSection/DuplicatesContent";
import { useLibraryScanStatus } from "@hooks/api/queries/useLibraryScanStatus";

import { MaintenancePage } from "./MaintenancePage";

export function DuplicatesSection() {
  const status = useLibraryScanStatus();

  return (
    <MaintenancePage surface="duplicates">
      <DuplicatesContent enabled reclaiming={status.data?.reclaimRunning ?? false} />
    </MaintenancePage>
  );
}
