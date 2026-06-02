import type { AppRouter } from "@api/__generated__/types";
import type { inferRouterOutputs } from "@trpc/server";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type ImportPreviewResult = RouterOutputs["portability"]["previewImport"];
export type CollectionCoverage = ImportPreviewResult["collections"][number];
export type TrackCoverage = CollectionCoverage["tracks"][number];

export type ImportStep = "source" | "preview";

export type ImportFormat = "jspf" | "xspf" | "csv";

export interface JspfImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface SourceStepProps {
  onLoaded: (content: string, format: ImportFormat, filename: string) => void;
}

export interface PreviewStepProps {
  jobId: string;
  preview: ImportPreviewResult | undefined;
  isPreviewing: boolean;
  isCommitting: boolean;
  errorMessage: string | null;
  selected: Set<string>;
  onToggleTrack: (collectionIndex: number, trackIndex: number) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export interface TrackCoverageRowProps {
  track: TrackCoverage;
  selected: boolean;
  onToggle: () => void;
}
