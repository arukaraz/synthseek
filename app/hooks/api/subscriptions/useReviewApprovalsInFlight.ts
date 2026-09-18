import { useMemo } from "react";

import { reviewApprovalsInFlight, useDockJobs } from "./shared/progressDock";

export function useReviewApprovalsInFlight(): ReadonlySet<string> {
  const jobs = useDockJobs();
  return useMemo(() => reviewApprovalsInFlight(jobs), [jobs]);
}
