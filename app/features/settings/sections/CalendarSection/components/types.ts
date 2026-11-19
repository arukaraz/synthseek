import type { KeyboardEvent } from "react";

import type { FollowedArtist, FollowFilter, FollowRelease, FollowSort } from "@hooks/api/queries/artist-follow/types";
import type { Selection } from "@hooks/ui/useSelection";

import type { CalendarView, DayGroup, GridDay, MonthRef } from "../types";

export interface ReleaseCardsProps {
  releases: readonly FollowRelease[];
  today: string | null;
}

export interface DayPanelProps extends ReleaseCardsProps {
  iso: string;
  releaseId: string | null;
  showTitle?: boolean;
}

export interface CalendarToolbarProps {
  month: MonthRef;
  view: CalendarView;
  count: number;
  onMonthChange: (month: MonthRef) => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
}

export interface ReleaseTypesStripProps {
  className?: string;
}

export interface LastCheckedProps {
  lastCheckedAt: Date | null;
}

export interface MonthGridProps {
  month: MonthRef;
  firstDay: number;
  releases: readonly FollowRelease[];
  today: string | null;
  width: number;
  onMonthChange: (month: MonthRef) => void;
}

export interface DayCellProps {
  day: GridDay;
  active: boolean;
  selected: boolean;
  compact: boolean;
  popover: boolean;
  today: string | null;
  open: { iso: string; releaseId: string | null } | null;
  onKeyDown: (event: KeyboardEvent<HTMLElement>, iso: string) => void;
  onFocusDay: (iso: string) => void;
  onOpen: (iso: string, releaseId: string | null) => void;
  onClose: () => void;
}

export interface ReleaseChipProps {
  release: FollowRelease;
  onOpen: (iso: string, releaseId: string | null) => void;
  iso: string;
}

export interface ReleaseAgendaProps {
  groups: readonly DayGroup[];
  today: string | null;
  month: MonthRef;
  width: number;
}

export interface FollowingTableProps {
  items: FollowedArtist[];
  selection: Selection<{ id: string }>;
}

export interface FollowingToolbarProps {
  search: string;
  sort: FollowSort;
  filter: FollowFilter;
  matching: number;
  total: number;
  withAutoRequest: number;
  onSearch: (next: string) => void;
  onSort: (next: FollowSort) => void;
  onFilter: (next: FollowFilter) => void;
  onFollowMostPlayed: () => void;
}

export interface CalendarEmptyProps {
  onFollowMostPlayed: () => void;
}
