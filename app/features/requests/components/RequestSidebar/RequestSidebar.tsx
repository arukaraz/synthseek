"use client";

import { RequestsEmptyState } from "../RequestsEmptyState";
import { RequestSidebarItem } from "./RequestSidebarItem";
import { sidebarContainer, sidebarList, sidebarListItem } from "./styles";
import type { RequestSidebarProps } from "./types";

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
          <li key={item.id} className={sidebarListItem()}>
            <RequestSidebarItem request={item} isSelected={item.id === selectedId} onSelect={() => onSelect(item.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
