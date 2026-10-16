"use client";

import { useLibraryScanStatus } from "@hooks/api/queries/useLibraryScanStatus";

import { DuplicatesContent } from "./DuplicatesContent";
import { MaintenancePage } from "./MaintenancePage";

export function DuplicatesSection() {
  const status = useLibraryScanStatus();

  return (
    <MaintenancePage surface="duplicates">
      <DuplicatesContent enabled reclaiming={status.data?.reclaimRunning ?? false} />
    </MaintenancePage>
  );
}
