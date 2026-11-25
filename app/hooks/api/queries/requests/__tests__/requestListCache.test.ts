import { RequestStatus } from "@api/__generated__/types";
import { QueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@utils/trpc";
import { beforeEach, describe, expect, it } from "vitest";

import { makeRequestListItem } from "@features/requests/__tests__/factories";
import {
  findCachedRequestListItem,
  patchRequestListItems,
  removeRequestListItem,
  restoreRequestList,
  snapshotRequestList,
} from "../requestListCache";
import type { RequestListCache } from "../types";

const DONE_KEY = getQueryKey(trpc.requests.list, { filter: "done" }, "infinite");
const ALL_KEY = getQueryKey(trpc.requests.list, { filter: "all" }, "infinite");

let client: QueryClient;

function seed(key: readonly unknown[], pages: Array<{ ids: string[]; total: number }>): void {
  const data: RequestListCache = {
    pages: pages.map((page) => ({
      items: page.ids.map((id) => makeRequestListItem({ id, external_id: `ext-${id}` })),
      total: page.total,
      next: null,
      previous: null,
    })),
    pageParams: pages.map(() => null),
  };
  client.setQueryData(key, data);
}

function ids(key: readonly unknown[]): string[][] {
  return (client.getQueryData<RequestListCache>(key)?.pages ?? []).map((page) => page.items.map((item) => item.id));
}

function totals(key: readonly unknown[]): number[] {
  return (client.getQueryData<RequestListCache>(key)?.pages ?? []).map((page) => page.total);
}

beforeEach(() => {
  client = new QueryClient();
  seed(ALL_KEY, [
    { ids: ["a", "b"], total: 4 },
    { ids: ["c", "d"], total: 4 },
  ]);
  seed(DONE_KEY, [{ ids: ["c"], total: 1 }]);
});

describe("request list cache", () => {
  it("patches an item on every page of every cached list", () => {
    patchRequestListItems(client, (item) =>
      item.id === "c" ? { ...item, status: RequestStatus.enum.cancelled } : item
    );

    expect(findCachedRequestListItem(client, (item) => item.id === "c")?.status).toBe(RequestStatus.enum.cancelled);
    expect(client.getQueryData<RequestListCache>(DONE_KEY)?.pages[0].items[0].status).toBe(
      RequestStatus.enum.cancelled
    );
  });

  it("removes an item and lowers the total only in the lists that held it", () => {
    removeRequestListItem(client, "a");

    expect(ids(ALL_KEY)).toEqual([["b"], ["c", "d"]]);
    expect(totals(ALL_KEY)).toEqual([3, 3]);
    expect(ids(DONE_KEY)).toEqual([["c"]]);
    expect(totals(DONE_KEY)).toEqual([1]);
  });

  it("puts every list back as it was from a snapshot", () => {
    const snapshot = snapshotRequestList(client);
    removeRequestListItem(client, "c");

    restoreRequestList(client, snapshot);

    expect(ids(ALL_KEY)).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
    expect(ids(DONE_KEY)).toEqual([["c"]]);
  });

  it("leaves a cached query of another procedure alone", () => {
    const detailKey = getQueryKey(trpc.requests.getDetail, { id: "a", contentType: "album" }, "query");
    client.setQueryData(detailKey, { id: "a" });

    patchRequestListItems(client, (item) => ({ ...item, name: "patched" }));

    expect(client.getQueryData(detailKey)).toEqual({ id: "a" });
    expect(findCachedRequestListItem(client, (item) => item.name !== "patched")).toBeUndefined();
  });
});
