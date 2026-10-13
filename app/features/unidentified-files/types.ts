import type { inferRouterOutputs } from "@trpc/server";
import type { LucideIcon } from "lucide-react";

import type { AppRouter } from "@api/__generated__/types";
import type { CheckboxPreview } from "@components/ui/Checkbox";

type UnidentifiedOutputs = inferRouterOutputs<AppRouter>["library"]["scan"]["unidentified"];

export type UnidentifiedGroup = UnidentifiedOutputs["list"]["groups"][number];
export type UnidentifiedFile = UnidentifiedGroup["files"][number];
export type AlbumCandidate = UnidentifiedOutputs["albumCandidates"]["candidates"][number];
export type AlbumProposal = UnidentifiedOutputs["albumProposal"];
export type ProposalFile = AlbumProposal["files"][number];
export type ProposalTrack = AlbumProposal["tracks"][number];
export type SongCandidate = UnidentifiedOutputs["songCandidates"]["candidates"][number];
export type TrackVerdict = ProposalFile["verdicts"][string];

export type ReviewTab = "review" | "ignored";

export type ChipTone = "ok" | "warn" | "bad" | "neutral";

export type ReviewStep =
  | { kind: "list" }
  | { kind: "album"; group: UnidentifiedGroup }
  | { kind: "song"; group: UnidentifiedGroup; file: UnidentifiedFile };

export interface EditionMismatch {
  number: number;
  song: string;
  file: string;
}

export interface UnidentifiedFilesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ReviewListProps {
  enabled: boolean;
  active: boolean;
  onMatchAlbum: (group: UnidentifiedGroup) => void;
  onMatchSong: (group: UnidentifiedGroup, file: UnidentifiedFile) => void;
}

export interface ActionMenuItem {
  key: string;
  icon: LucideIcon;
  label: string;
  help?: string;
  onSelect: () => void;
}

export interface ActionMenuProps {
  label: string;
  items: ActionMenuItem[];
  disabled?: boolean;
}

export interface GroupRowProps {
  group: UnidentifiedGroup;
  tab: ReviewTab;
  selected: boolean;
  previewTone: CheckboxPreview;
  busy: boolean;
  onSelect: (extend: boolean) => void;
  onPreviewHover: (hovering: boolean) => void;
  onMatchAlbum: () => void;
  onMatchSong: (file: UnidentifiedFile) => void;
  onRetry: (fileIds: string[]) => void;
  onIgnore: (fileIds: string[]) => void;
  onStopIgnoring: (fileIds: string[]) => void;
}

export interface FileRowProps {
  file: UnidentifiedFile;
  tab: ReviewTab;
  busy: boolean;
  onMatchSong: () => void;
  onRetry: () => void;
  onIgnore: () => void;
}

export interface StepHeaderProps {
  title: string;
  description: string;
  onBack: () => void;
}

export interface LinkFieldProps {
  placeholder: string;
  pending: boolean;
  notFound: boolean;
  onSubmit: (url: string) => void;
}

export interface MatchAlbumPanelProps {
  group: UnidentifiedGroup;
  onBack: () => void;
}

export interface AlbumCandidateRowProps {
  candidate: AlbumCandidate;
  picked: boolean;
  onPick: () => void;
}

export interface MappingRowProps {
  file: ProposalFile;
  tracks: ProposalTrack[];
  trackId: string | null;
  onChange: (trackId: string | null) => void;
}

export interface MatchSongPanelProps {
  group: UnidentifiedGroup;
  file: UnidentifiedFile;
  onBack: () => void;
}

export interface SongCandidateRowProps {
  candidate: SongCandidate;
  fileDurationSeconds: number | null;
  picked: boolean;
  onPick: () => void;
}
