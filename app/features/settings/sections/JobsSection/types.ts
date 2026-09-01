import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";

export type JobSummary = inferRouterOutputs<AppRouter>["jobs"]["list"][number];

export interface JobRowProps {
  job: JobSummary;
}

export interface DuplicatesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reclaiming: boolean;
}
