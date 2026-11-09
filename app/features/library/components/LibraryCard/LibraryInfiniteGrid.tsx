"use client";

import { Fragment } from "react";

import { LibraryLoadMore } from "../LibraryLoadMore/LibraryLoadMore";
import { LibraryCardGrid } from "./LibraryCardGrid";
import type { LibraryInfiniteGridProps } from "./types";

export function LibraryInfiniteGrid<TItem>({
  items,
  ariaLabel,
  density,
  renderCard,
  getCardId,
  scrollRoot,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: LibraryInfiniteGridProps<TItem>) {
  return (
    <>
      <LibraryCardGrid ariaLabel={ariaLabel} density={density}>
        {items.map((item) => (
          <Fragment key={getCardId(item)}>{renderCard(item)}</Fragment>
        ))}
      </LibraryCardGrid>
      <LibraryLoadMore
        scrollRoot={scrollRoot}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />
    </>
  );
}
