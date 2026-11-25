"use client";

import { useInfiniteScroll } from "@hooks/ui/useInfiniteScroll";
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
  emptySourceLabel,
  filtered,
  hasNextPage,
  isFetchingNextPage,
  onLoadNext,
  hasPreviousPage,
  isFetchingPreviousPage,
  onLoadPrevious,
  className,
}: RequestSidebarProps) {
  const [scrollRoot, setScrollRoot] = useState<HTMLUListElement | null>(null);
  const nextSentinelRef = useInfiniteScroll({
    root: scrollRoot,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore: onLoadNext,
  });
  const previousSentinelRef = useInfiniteScroll({
    root: scrollRoot,
    hasNextPage: hasPreviousPage,
    isFetchingNextPage: isFetchingPreviousPage,
    onLoadMore: onLoadPrevious,
  });

  if (items.length === 0) {
    return (
      <div className={`${sidebarContainer()} ${className ?? ""}`} data-part="sidebar">
        <div className="flex flex-1 items-center justify-center p-4">
          <RequestsEmptyState searchQuery={searchQuery} emptySourceLabel={emptySourceLabel} filtered={filtered} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${sidebarContainer()} ${className ?? ""}`} data-cy="requests-sidebar" data-part="sidebar">
      <ul ref={setScrollRoot} className={sidebarList()}>
        {hasPreviousPage ? (
          <li role="presentation">
            <div ref={previousSentinelRef} className={sidebarSentinel()} />
          </li>
        ) : null}
        {items.map((item) => (
          <li key={item.id} className={sidebarListItem()}>
            <RequestSidebarItem request={item} isSelected={item.id === selectedId} onSelect={() => onSelect(item.id)} />
          </li>
        ))}
        {hasNextPage ? (
          <li role="presentation">
            <div ref={nextSentinelRef} className={sidebarSentinel()} />
          </li>
        ) : null}
      </ul>
    </div>
  );
}
