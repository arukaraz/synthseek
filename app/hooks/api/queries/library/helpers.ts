interface PageWithItemsAndTotal {
  items: unknown[];
  total: number;
}

export function getNextOffset(lastPage: PageWithItemsAndTotal, allPages: PageWithItemsAndTotal[]): number | undefined {
  const loaded = allPages.reduce((count, page) => count + page.items.length, 0);
  return loaded < lastPage.total ? loaded : undefined;
}

export function batchLimitThrough(offset: number, through: number, batch: number, max: number): number {
  return Math.min(max, Math.max(batch, through - offset + batch));
}

export function cachedPageSize(
  data: { pages: readonly PageWithItemsAndTotal[]; pageParams: readonly unknown[] } | undefined,
  pageParam: number
): number | undefined {
  const size = data?.pages[data.pageParams.indexOf(pageParam)]?.items.length;
  return size ? size : undefined;
}

export function loadedCount(pages: readonly PageWithItemsAndTotal[] | undefined): number {
  return (pages ?? []).reduce((count, page) => count + page.items.length, 0);
}
