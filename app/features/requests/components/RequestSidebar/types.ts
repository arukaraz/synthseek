import type { RequestWithTracks } from "@api/__generated__/types";

export interface RequestSidebarProps {
  items: RequestWithTracks[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery?: string;
  className?: string;
}

export interface RequestSidebarItemProps {
  request: RequestWithTracks;
  isSelected: boolean;
  onSelect: () => void;
}
