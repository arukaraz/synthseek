import type { AppRouter, RequestListItem } from "@api/__generated__/types";
import type { InfiniteData } from "@tanstack/react-query";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

type RequestListQueryInput = inferRouterInputs<AppRouter>["requests"]["list"];

export type RequestListInput = Omit<RequestListQueryInput, "cursor" | "limit">;

export type RequestListCursor = NonNullable<RequestListQueryInput["cursor"]>;

export type RequestListPageParam = RequestListCursor | null;

export type RequestListPage = inferRouterOutputs<AppRouter>["requests"]["list"];

export type RequestListCache = InfiniteData<RequestListPage, RequestListPageParam>;

export interface RequestListResult {
  items: RequestListItem[];
  total: number;
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  hasPreviousPage: boolean;
  isFetchingPreviousPage: boolean;
  fetchPreviousPage: () => void;
}
