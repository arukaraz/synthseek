"use client";

import { useEffect, useRef } from "react";

import { INFINITE_SCROLL_ROOT_MARGIN } from "../constants";
import type { UseInfiniteScrollArgs } from "../types";

export function useInfiniteScroll({ root, hasNextPage, isFetchingNextPage, onLoadMore }: UseInfiniteScrollArgs) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMoreRef.current();
      },
      { root: root ?? null, rootMargin: INFINITE_SCROLL_ROOT_MARGIN }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [root, hasNextPage, isFetchingNextPage]);

  return sentinelRef;
}
