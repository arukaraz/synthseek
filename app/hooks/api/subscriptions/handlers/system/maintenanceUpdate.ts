import type { MaintenanceUpdatePayload } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";

type TrpcUtils = ReturnType<typeof trpc.useUtils>;

export function handleMaintenanceUpdate(event: MaintenanceUpdatePayload, utils: TrpcUtils): void {
  utils.maintenance.counts.invalidate();

  switch (event.surface) {
    case "review":
      utils.requests.review.list.invalidate();
      return;
    case "duplicates":
      utils.library.scan.duplicateGroups.invalidate();
      utils.library.scan.status.invalidate();
      return;
    case "recycleBin":
      utils.settings.recycleBin.list.invalidate();
      utils.settings.recycleBin.status.invalidate();
      return;
    case "quarantine":
      utils.settings.quarantine.list.invalidate();
      return;
  }
}
