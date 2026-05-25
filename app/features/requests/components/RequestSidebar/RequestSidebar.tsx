"use client";

import type { RequestWithTracks } from "@api/__generated__/types";
import { RequestsEmptyState } from "../RequestsEmptyState";
import { RequestSidebarItem } from "./RequestSidebarItem";
import { sidebarContainer, sidebarList } from "./styles";

interface RequestSidebarProps {
  items: RequestWithTracks[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery?: string;
  className?: string;
}

export function RequestSidebar({ items, selectedId, onSelect, searchQuery, className }: RequestSidebarProps) {
  if (items.length === 0) {
    return (
      <div className={`${sidebarContainer()} ${className ?? ""}`}>
        <div className="flex flex-1 items-center justify-center p-4">
          <RequestsEmptyState searchQuery={searchQuery} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${sidebarContainer()} ${className ?? ""}`} data-cy="requests-sidebar">
      <ul className={sidebarList()}>
        {items.map((item) => (
          <li key={item.id}>
            <RequestSidebarItem request={item} isSelected={item.id === selectedId} onSelect={() => onSelect(item.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
