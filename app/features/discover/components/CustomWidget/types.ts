import type { MusicItem } from "@api/__generated__/types";
import type { DetailTarget } from "@features/content-detail";
import type { BoardSize } from "@hooks/api/queries/board/types";
import type { PlayableTracksTarget } from "@hooks/api/queries/library/types";
import type { WidgetAccent, WidgetDocument, WidgetResult } from "@hooks/api/queries/widgets/types";

import type { CustomWidgetsStatus } from "../ExploreBoard/types";

export interface WidgetItem {
  key: string;
  title: string;
  subtitle: string;
  cover: string | null;
  value: string | null;
  date: string | null;
  play: PlayableTracksTarget | null;
  request: MusicItem | null;
  open: DetailTarget | null;
}

export interface WidgetStat {
  key: string;
  label: string;
  value: string;
  delta: number | null;
}

export interface WidgetItemControls {
  onSelect?: () => void;
  coverAction?: { kind: "play" | "request"; label: string; onClick: () => void };
}

export type WidgetItemActions = (item: WidgetItem) => WidgetItemControls;

export interface WidgetHandlers {
  play: (target: PlayableTracksTarget) => void;
  request: (item: MusicItem) => void;
  open: (target: DetailTarget) => void;
}

export interface WidgetBlockProps {
  items: readonly WidgetItem[];
  stats: readonly WidgetStat[];
  size: BoardSize;
  accent: WidgetAccent;
  controls: WidgetItemActions;
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

export interface CustomWidgetNoteInput {
  result: WidgetResult | undefined;
  isError: boolean;
  empty: boolean;
  supported: boolean;
}

export interface WidgetCardProps {
  item: WidgetItem;
  accent: WidgetAccent;
  controls: WidgetItemControls;
}
