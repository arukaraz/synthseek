import type { ReactNode } from "react";

import type { EngineImportSettings, MaintenanceCounts, SystemProblem } from "../../types";

import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";

export type MaintenanceSurfaceKey = keyof MaintenanceCounts;

export type DownloadedAlbum = inferRouterOutputs<AppRouter>["settings"]["stagedReleases"]["list"][number];

export type DownloadedAlbumFilter = "all" | DownloadedAlbum["source"];

export type SystemProblemCopyParams = Partial<Record<"path" | "puid" | "pgid" | "name" | "label", string>>;

export interface SystemProblemRowProps {
  problem: SystemProblem;
}

export interface MaintenancePageProps {
  surface: MaintenanceSurfaceKey;
  descriptionAsTooltip?: boolean;
  children: ReactNode;
}

export type QuarantineGroup = inferRouterOutputs<AppRouter>["settings"]["quarantine"]["list"][number];

export interface QuarantineGroupRowProps {
  group: QuarantineGroup;
  removing: boolean;
  onRemove: (group: QuarantineGroup) => void;
}

export interface QuarantineSourceTrust {
  bannedUsersCount: number;
  banAfterFailedAttempts: number;
}

export interface QuarantineCardProps {
  initial: EngineImportSettings;
  sourceTrust: QuarantineSourceTrust;
}

export interface RecycleBinListProps {
  entryCount: number;
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
