"use client";

import { useHoldRequestListRows } from "@hooks/api";
import { useInfiniteScroll } from "@hooks/ui/useInfiniteScroll";
import { useScrollEdges } from "@hooks/ui/useScrollEdges";
import { listPositionAttributes, listPositionOf } from "@utils/list-position";

import { RequestsEmptyState } from "../RequestsEmptyState";
import { RequestSidebarItem } from "./RequestSidebarItem";
import { sidebarContainer, sidebarList, sidebarListItem, sidebarSentinel } from "./styles";
import type { RequestSidebarProps } from "./types";

export function RequestSidebar({
  items,
  total,
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
  const edges = useScrollEdges<HTMLUListElement>("y");
  const scrollRoot = edges.node;
  useHoldRequestListRows(edges.start);
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
      <ul ref={edges.ref} className={sidebarList()}>
        {hasPreviousPage ? (
          <li aria-hidden="true">
            <div ref={previousSentinelRef} className={sidebarSentinel()} />
          </li>
        ) : null}
        {items.map((item, index) => (
          <li
            key={item.id}
            className={sidebarListItem()}
            {...listPositionAttributes(
              hasPreviousPage || total === undefined ? undefined : listPositionOf(index, total)
            )}
          >
            <RequestSidebarItem request={item} isSelected={item.id === selectedId} onSelect={() => onSelect(item.id)} />
          </li>
        ))}
        {hasNextPage ? (
          <li aria-hidden="true">
            <div ref={nextSentinelRef} className={sidebarSentinel()} />
          </li>
        ) : null}
      </ul>
    </div>
  );
}
