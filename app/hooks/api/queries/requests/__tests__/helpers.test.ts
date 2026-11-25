import { describe, expect, it } from "vitest";

import { makeRequestListItem } from "@features/requests/__tests__/factories";
import { nextRequestListCursor, previousRequestListCursor, uniqueRequestListItems } from "../helpers";
import type { RequestListCursor, RequestListPage } from "../types";

function cursor(edge: RequestListCursor["edge"], id: string): RequestListCursor {
  return {
    edge,
    key: {
      id,
      updated_at: new Date("2026-11-01T00:00:00Z"),
      name: id,
      credited_artist: "Artist",
      contentType: "album",
    },
  };
}

function page(ids: string[], fields: Partial<Pick<RequestListPage, "next" | "previous">> = {}): RequestListPage {
  return {
    items: ids.map((id) => makeRequestListItem({ id, external_id: `ext-${id}`, updated_at: new Date() })),
    total: 10,
    next: null,
    previous: null,
    ...fields,
  };
}

describe("request list cursors", () => {
  it("follows the cursors the server sent, not the rows the cache patched since", () => {
    const loaded = page(["a", "b"], { next: cursor("after", "b"), previous: cursor("before", "a") });

    expect(nextRequestListCursor(loaded)).toEqual(cursor("after", "b"));
    expect(previousRequestListCursor(loaded)).toEqual(cursor("before", "a"));
  });

  it("reports no further page where the server sent none", () => {
    expect(nextRequestListCursor(page(["a"]))).toBeUndefined();
    expect(previousRequestListCursor(page(["a"]))).toBeUndefined();
  });

  it("shows a row that moved between two loaded pages only once", () => {
    const items = uniqueRequestListItems([page(["a", "b"]), page(["b", "c"])]);

    expect(items.map((item) => item.id)).toEqual(["a", "b", "c"]);
  });
});
