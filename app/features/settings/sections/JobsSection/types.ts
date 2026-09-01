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

export interface DuplicateGroupSummary {
  copies: readonly unknown[];
  formats: readonly string[];
  minBytes: number;
  maxBytes: number;
  distinctLengths: number | null;
}

export interface CopyRowProps {
  copy: { id: string; fileName: string; sizeBytes: number; durationSeconds: number | null; serving: boolean };
  disabled: boolean;
  keeping: boolean;
  playing: boolean;
  onPlayChange: (id: string | null) => void;
  onKeep: () => void;
}
