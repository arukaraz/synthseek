"use client";

import { Spinner } from "@components/ui/Spinner";
import { useInfiniteScroll } from "@hooks/ui/useInfiniteScroll";
import { useTranslation } from "react-i18next";

import { loadMoreSentinel, loadMoreSpinnerRow } from "./styles";
import type { LibraryLoadMoreProps } from "./types";

export function LibraryLoadMore({ scrollRoot, hasNextPage, isFetchingNextPage, fetchNextPage }: LibraryLoadMoreProps) {
  const { t } = useTranslation("library");
  const sentinelRef = useInfiniteScroll({
    root: scrollRoot,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore: fetchNextPage,
  });

  return (
    <>
      {hasNextPage ? <div ref={sentinelRef} className={loadMoreSentinel()} aria-hidden="true" /> : null}
      {isFetchingNextPage ? (
        <div className={loadMoreSpinnerRow()}>
          <Spinner size="md" label={t("page.loading")} />
        </div>
      ) : null}
    </>
  );
}
