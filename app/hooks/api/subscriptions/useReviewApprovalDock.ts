import { HeldImportStatus } from "@api/__generated__/types";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { trpc } from "@utils/trpc";
import { useEffect } from "react";

import { reconcileReviewDock } from "./shared/progressDock";

export function useReviewApprovalDock(): void {
  const { isAdmin } = useAuthContext();
  const { data } = trpc.requests.review.list.useQuery(undefined, {
    enabled: isAdmin,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data === undefined) return;
    reconcileReviewDock(
      data.items.map((item) => ({
        id: item.id,
        importing: item.status === HeldImportStatus.enum.importing,
        failed: item.status === HeldImportStatus.enum.import_failed,
        hasError: item.error !== null,
      }))
    );
  }, [data]);
}
