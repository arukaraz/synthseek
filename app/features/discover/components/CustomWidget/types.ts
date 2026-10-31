import type { LucideIcon } from "lucide-react";

import type { MusicItem } from "@api/__generated__/types";
import type { DetailTarget } from "@features/content-detail";
import type { BoardSize } from "@hooks/api/queries/board/types";
import type { PlayableTracksTarget } from "@hooks/api/queries/library/types";
import type {
  WidgetAccent,
  WidgetBlock,
  WidgetDocument,
  WidgetResult,
  WidgetShape,
} from "@hooks/api/queries/widgets/types";

import type { CustomWidgetsStatus } from "../ExploreBoard/types";
import type { StoryPage } from "../WidgetStory/types";

export type WidgetMove = { kind: "rank"; by: number } | { kind: "value"; by: number } | { kind: "new" };

export type MoveDirection = "up" | "down" | "same" | "new";

export interface WidgetItem {
  key: string;
  title: string;
  subtitle: string;
  cover: string | null;
  value: string | null;
  date: string | null;
  move: WidgetMove | null;
  play: PlayableTracksTarget | null;
  request: MusicItem | null;
  open: DetailTarget | null;
  link: string | null;
  covers?: readonly string[];
  listSlot?: string;
  pinned?: boolean;
}

export interface WidgetStat {
  key: string;
  label: string;
  value: string;
  delta: number | null;
}

export interface WidgetPoint {
  key: string;
  label: string;
  value: number;
  prev: number | null;
  text: string;
  prevText: string | null;
}

export type WidgetCells = readonly (readonly number[])[];

export interface WidgetView {
  shape: WidgetShape | null;
  items: readonly WidgetItem[];
  stats: readonly WidgetStat[];
  points: readonly WidgetPoint[];
  cells: WidgetCells;
  pages: readonly StoryPage[];
  covers: readonly string[];
}

export interface WidgetItemControls {
  onSelect?: () => void;
  coverAction?: { kind: "play" | "request"; label: string; onClick: () => void };
}

export type WidgetItemActions = (item: WidgetItem) => WidgetItemControls;

export interface WidgetHandlers {
  play: (target: PlayableTracksTarget) => void;
  shuffle: (target: PlayableTracksTarget) => void;
  radio: (target: PlayableTracksTarget) => void;
  request: (item: MusicItem) => void;
  open: (target: DetailTarget) => void;
  openUrl: (url: string) => void;
}

export interface WidgetBlockHeading {
  name: string;
  description: string;
  icon: LucideIcon;
}

export interface WidgetBlockProps extends WidgetView {
  size: BoardSize;
  accent: WidgetAccent;
  controls: WidgetItemActions;
  heading: WidgetBlockHeading;
}

export interface CustomWidgetProps {
  widget: WidgetDocument | null;
  status: CustomWidgetsStatus;
  size: BoardSize;
}

export interface CustomWidgetBodyProps {
  widget: WidgetDocument;
  size: BoardSize;
}

export interface CustomWidgetContentProps {
  widget: Pick<WidgetDocument, "meta" | "view">;
  size: BoardSize;
  result: WidgetResult | undefined;
  isLoading: boolean;
  isError: boolean;
  onOpenList?: (slotId: string) => void;
}

export interface CustomWidgetNoteInput {
  result: WidgetResult | undefined;
  isError: boolean;
  empty: boolean;
}

export interface BlockSuggestionInput {
  shape: WidgetShape;
  compare: boolean;
  numeric: boolean;
  dailyYear: boolean;
}

export interface BlockContractView {
  key: WidgetBlock;
  shapes: readonly WidgetShape[];
  needsCompare: boolean;
  needsNumbers: boolean;
}

export type WidgetCardSurface = "framed" | "bare";

export interface WidgetCardProps {
  item: WidgetItem;
  accent: WidgetAccent;
  controls: WidgetItemControls;
  surface: WidgetCardSurface;
  single?: boolean;
}

export interface CoverActionButtonProps {
  action: NonNullable<WidgetItemControls["coverAction"]>;
}
