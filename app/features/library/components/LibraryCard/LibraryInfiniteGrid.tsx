"use client";

import { ListPositionContext } from "@hooks/ui/useListPosition";
import { listPositionOf } from "@utils/list-position";

import { LibraryLoadMore } from "../LibraryLoadMore/LibraryLoadMore";
import { LibraryCardGrid } from "./LibraryCardGrid";
import type { LibraryInfiniteGridProps } from "./types";

export function LibraryInfiniteGrid<TItem>({
  items,
  total = items.length,
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
        {items.map((item, index) => (
          <ListPositionContext.Provider key={getCardId(item)} value={listPositionOf(index, total)}>
            {renderCard(item)}
          </ListPositionContext.Provider>
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
