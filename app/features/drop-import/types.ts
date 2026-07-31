import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";
import type { DropImportRejectedEntry, DropImportUploadResult } from "@hooks/api";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type DropImportBatch = RouterOutputs["import"]["listBatches"][number];
export type DropImportBatchWithFiles = RouterOutputs["import"]["getBatch"];
export type DropImportFile = DropImportBatchWithFiles["files"][number];

export interface DropImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface UploadPanelProps {
  onResult: (result: DropImportUploadResult) => void;
}

export interface RejectedFilesListProps {
  entries: DropImportRejectedEntry[];
}

export interface BatchListProps {
  onOpenBatch: (batchId: string) => void;
}

export interface BatchDetailProps {
  batchId: string;
  rejected: DropImportRejectedEntry[];
  onBack: () => void;
}

export interface FileRowProps {
  file: DropImportFile;
  isMatchOpen: boolean;
  onToggleMatch: () => void;
}

export interface FileStatusBadgeProps {
  file: DropImportFile;
}

export interface BatchStatusBadgeProps {
  status: DropImportBatch["status"];
}

export interface MatchSearchPanelProps {
  file: DropImportFile;
  onClose: () => void;
}
