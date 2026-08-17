import type { RequestListItem } from "@api/__generated__/types";

export interface RequestSidebarProps {
  items: RequestListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery?: string;
  className?: string;
}

export interface RequestSidebarItemProps {
  request: RequestListItem;
  isSelected: boolean;
  onSelect: () => void;
}
