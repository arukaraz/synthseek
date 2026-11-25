import type { RequestListItem } from "@api/__generated__/types";

import type { RequestListCursor, RequestListPage } from "./types";

export function nextRequestListCursor(lastPage: RequestListPage): RequestListCursor | undefined {
  return lastPage.next ?? undefined;
}

export function previousRequestListCursor(firstPage: RequestListPage): RequestListCursor | undefined {
  return firstPage.previous ?? undefined;
}

export function uniqueRequestListItems(pages: readonly RequestListPage[]): RequestListItem[] {
  const seen = new Set<string>();
  return pages.flatMap((page) =>
    page.items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
  );
}
