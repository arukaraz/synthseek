import type { inferRouterOutputs } from "@trpc/server";
import type { TFunction } from "i18next";

import type { AppRouter } from "@api/__generated__/types";

export type JobSummary = inferRouterOutputs<AppRouter>["jobs"]["list"][number];

export type LibraryScanPath = inferRouterOutputs<AppRouter>["library"]["scan"]["status"]["paths"][number];

export type LibraryScanOutcome = NonNullable<LibraryScanPath["lastScanOutcome"]>;

export interface ScanPathColumnsArgs {
  t: TFunction<"settings">;
  busy: boolean;
  onScan: (path: LibraryScanPath) => void;
}

export interface JobRowProps {
  job: JobSummary;
}

export interface DuplicatesContentProps {
  enabled: boolean;
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
  copy: {
    id: string;
    fileName: string;
    sizeBytes: number;
    durationSeconds: number | null;
    serving: boolean;
    libraryPath: string;
  };
  showPath: boolean;
  disabled: boolean;
  keeping: boolean;
  playing: boolean;
  onPlayChange: (id: string | null) => void;
  onKeep: () => void;
}
