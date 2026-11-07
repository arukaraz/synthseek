import type { ReactNode } from "react";

import type { EngineImportSettings, MaintenanceCounts, SystemProblem } from "../../types";

import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";
import type { ComparedCopy, CopyComparison } from "@hooks/ui/copyComparison";

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

export type DuplicateGroup = inferRouterOutputs<AppRouter>["library"]["scan"]["duplicateGroups"]["groups"][number];

export type DuplicateCopy = DuplicateGroup["copies"][number];

export interface DuplicateComparatorProps {
  group: DuplicateGroup;
  busy: boolean;
  onKeep: (copy: DuplicateCopy) => void;
  onNoneFits: () => void;
}

export interface CopyLaneProps {
  copy: DuplicateCopy;
  index: number;
  comparison: CopyComparison;
  compared: ComparedCopy;
  isReference: boolean;
  showPath: boolean;
  busy: boolean;
  onKeep: () => void;
}

export interface RejectCopiesDialogProps {
  group: DuplicateGroup | null;
  pending: boolean;
  onCancel: () => void;
  onConfirm: (searchAgain: boolean) => void;
}

export interface ComparatorTransportProps {
  comparison: CopyComparison;
}
