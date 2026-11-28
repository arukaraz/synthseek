import type { RequestListItem } from "@api/__generated__/types";

export interface RequestSidebarProps {
  items: RequestListItem[];
  total?: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery?: string;
  emptySourceLabel?: string | null;
  filtered?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadNext: () => void;
  hasPreviousPage: boolean;
  isFetchingPreviousPage: boolean;
  onLoadPrevious: () => void;
  className?: string;
}

export interface RequestSidebarReleaseProps {
  albumId: string;
}

export interface RequestSidebarItemProps {
  request: RequestListItem;
  isSelected: boolean;
  onSelect: () => void;
}
