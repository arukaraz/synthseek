"use client";

import { useLibraryScanStatus } from "@hooks/api/queries/useLibraryScanStatus";

import { DuplicateResolutionRow } from "./DuplicateResolutionRow";
import { DuplicatesContent } from "./DuplicatesContent";
import { MaintenancePage } from "./MaintenancePage";

export function DuplicatesSection() {
  const status = useLibraryScanStatus();

  return (
    <MaintenancePage surface="duplicates">
      <DuplicateResolutionRow />
      <DuplicatesContent enabled reclaiming={status.data?.reclaimRunning ?? false} />
    </MaintenancePage>
  );
}
