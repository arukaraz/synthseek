"use client";

import { Spinner } from "@components/ui/Spinner";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";

import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { LibraryCardGrid } from "./LibraryCardGrid";
import { infiniteSentinel, infiniteSpinnerRow } from "./styles";
import type { LibraryInfiniteGridProps } from "./types";

export function LibraryInfiniteGrid<TItem>({
  items,
  ariaLabel,
  renderCard,
  getCardId,
  scrollRoot,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: LibraryInfiniteGridProps<TItem>) {
  const { t } = useTranslation("library");
  const sentinelRef = useInfiniteScroll({
    root: scrollRoot,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore: fetchNextPage,
  });

  return (
    <>
      <LibraryCardGrid ariaLabel={ariaLabel}>
        {items.map((item) => (
          <Fragment key={getCardId(item)}>{renderCard(item)}</Fragment>
        ))}
      </LibraryCardGrid>
      {hasNextPage ? <div ref={sentinelRef} className={infiniteSentinel()} aria-hidden="true" /> : null}
      {isFetchingNextPage ? (
        <div className={infiniteSpinnerRow()}>
          <Spinner size="md" label={t("page.loading")} />
        </div>
      ) : null}
    </>
  );
}
