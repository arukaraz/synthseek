import type { ReactNode } from "react";

import type { EngineImportSettings, QuarantineSourceTrust } from "../EngineSection/types";

import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";

export type MaintenanceCounts = inferRouterOutputs<AppRouter>["maintenance"]["counts"];

export type MaintenanceSurfaceKey = keyof MaintenanceCounts;

export type DownloadedAlbum = inferRouterOutputs<AppRouter>["settings"]["stagedReleases"]["list"][number];

export type DownloadedAlbumFilter = "all" | DownloadedAlbum["source"];

export type SystemProblem = inferRouterOutputs<AppRouter>["maintenance"]["systemStatus"]["problems"][number];

export type SystemProblemCopyParams = Partial<Record<"path" | "puid" | "pgid" | "name" | "label", string>>;

export interface SystemProblemRowProps {
  problem: SystemProblem;
}

export interface MaintenancePageProps {
  surface: MaintenanceSurfaceKey;
  children: ReactNode;
}

export type QuarantineGroup = inferRouterOutputs<AppRouter>["settings"]["quarantine"]["list"][number];

export interface QuarantineGroupRowProps {
  group: QuarantineGroup;
  removing: boolean;
  onRemove: (group: QuarantineGroup) => void;
}

export interface QuarantineCardProps {
  initial: EngineImportSettings;
  sourceTrust: QuarantineSourceTrust;
}

export interface RecycleBinListProps {
  entryCount: number;
}
