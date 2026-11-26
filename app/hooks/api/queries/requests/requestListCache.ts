import type { RequestListItem } from "@api/__generated__/types";
import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@utils/trpc";

import type { RequestListCache } from "./types";

type Utils = ReturnType<typeof trpc.useUtils>;

export type RequestListSnapshot = ReadonlyArray<[QueryKey, RequestListCache | undefined]>;

function listFilter() {
  return { queryKey: getQueryKey(trpc.requests.list, undefined, "infinite") };
}

export async function cancelRequestList(queryClient: QueryClient): Promise<void> {
  await queryClient.cancelQueries(listFilter());
}

export function snapshotRequestList(queryClient: QueryClient): RequestListSnapshot {
  return queryClient.getQueriesData<RequestListCache>(listFilter());
}

export function restoreRequestList(queryClient: QueryClient, snapshot: RequestListSnapshot): void {
  for (const [key, data] of snapshot) queryClient.setQueryData(key, data);
}

export function patchRequestListItems(
  queryClient: QueryClient,
  patch: (item: RequestListItem) => RequestListItem
): void {
  queryClient.setQueriesData<RequestListCache>(listFilter(), (old) =>
    old ? { ...old, pages: old.pages.map((page) => ({ ...page, items: page.items.map(patch) })) } : old
  );
}

export function removeRequestListItem(queryClient: QueryClient, id: string): void {
  queryClient.setQueriesData<RequestListCache>(listFilter(), (old) => {
    if (!old) return old;
    const held = old.pages.some((page) => page.items.some((item) => item.id === id));
    if (!held) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.filter((item) => item.id !== id),
        total: Math.max(0, page.total - 1),
      })),
    };
  });
}

export function trimRequestListToFirstPage(queryClient: QueryClient): void {
  queryClient.setQueriesData<RequestListCache>(listFilter(), (old) =>
    old && old.pages.length > 1 ? { pages: old.pages.slice(0, 1), pageParams: old.pageParams.slice(0, 1) } : old
  );
}

export function findCachedRequestListItem(
  queryClient: QueryClient,
  match: (item: RequestListItem) => boolean
): RequestListItem | undefined {
  for (const [, data] of snapshotRequestList(queryClient)) {
    for (const page of data?.pages ?? []) {
      const found = page.items.find(match);
      if (found) return found;
    }
  }
  return undefined;
}

export function invalidateRequestListQueries(utils: Utils): void {
  void utils.requests.list.invalidate();
  void utils.requests.summary.invalidate();
}
