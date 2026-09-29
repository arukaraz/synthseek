import type { ReactNode } from "react";

import type { EngineImportSettings, QuarantineSourceTrust } from "../EngineSection/types";

import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";

export type MaintenanceCounts = inferRouterOutputs<AppRouter>["maintenance"]["counts"];

export type MaintenanceSurfaceKey = keyof MaintenanceCounts;

export type SystemProblem = inferRouterOutputs<AppRouter>["maintenance"]["systemStatus"]["problems"][number];

export type SystemProblemCopyParams = Partial<Record<"path" | "puid" | "pgid" | "name", string>>;

export interface SystemProblemRowProps {
  problem: SystemProblem;
}

export interface MaintenancePageProps {
  surface: MaintenanceSurfaceKey;
  children: ReactNode;
}

export interface QuarantineCardProps {
  initial: EngineImportSettings;
  sourceTrust: QuarantineSourceTrust;
}

export interface RecycleBinListProps {
  entryCount: number;
}
