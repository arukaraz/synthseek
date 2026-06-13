interface PageWithItemsAndTotal {
  items: unknown[];
  total: number;
}

export function getNextOffset(lastPage: PageWithItemsAndTotal, allPages: PageWithItemsAndTotal[]): number | undefined {
  const loaded = allPages.reduce((count, page) => count + page.items.length, 0);
  return loaded < lastPage.total ? loaded : undefined;
}

export function stripPaging<TInput extends { offset?: number; limit?: number }>(
  input: TInput
): Omit<TInput, "offset" | "limit"> {
  const { offset: _offset, limit: _limit, ...rest } = input;
  return rest;
}
