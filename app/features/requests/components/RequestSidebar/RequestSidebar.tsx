"use client";

import { useInfiniteScroll } from "@hooks/ui/useInfiniteScroll";
import { useRenderWindow } from "@hooks/ui/useRenderWindow";
import { useState } from "react";

import { RequestsEmptyState } from "../RequestsEmptyState";
import { RequestSidebarItem } from "./RequestSidebarItem";
import { sidebarContainer, sidebarList, sidebarListItem, sidebarSentinel } from "./styles";
import type { RequestSidebarProps } from "./types";

export function RequestSidebar({
  items,
  selectedId,
  onSelect,
  searchQuery,
  windowKey,
  className,
}: RequestSidebarProps) {
  const [scrollRoot, setScrollRoot] = useState<HTMLUListElement | null>(null);
  const { visible, hasMore, loadMore } = useRenderWindow(items, windowKey);
  const sentinelRef = useInfiniteScroll({
    root: scrollRoot,
    hasNextPage: hasMore,
    isFetchingNextPage: false,
    onLoadMore: loadMore,
  });

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
      <ul ref={setScrollRoot} className={sidebarList()}>
        {visible.map((item) => (
          <li key={item.id} className={sidebarListItem()}>
            <RequestSidebarItem request={item} isSelected={item.id === selectedId} onSelect={() => onSelect(item.id)} />
          </li>
        ))}
        {hasMore ? (
          <li role="presentation">
            <div ref={sentinelRef} className={sidebarSentinel()} />
          </li>
        ) : null}
      </ul>
    </div>
  );
}
