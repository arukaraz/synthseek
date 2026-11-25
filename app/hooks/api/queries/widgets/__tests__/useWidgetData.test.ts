import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFeedArtistResult, createFeedArtistRow, createWidget } from "@test/factories";

import { WARMING_REFETCH_MS } from "../constants";
import { useWidgetData } from "../useWidgetData";
import { useWidgetPreview } from "../useWidgetPreview";

const { dataQuery, previewQuery } = vi.hoisted(() => ({ dataQuery: vi.fn(), previewQuery: vi.fn() }));

vi.mock("@utils/trpc", () => ({
  trpc: { widgets: { data: { useQuery: dataQuery }, preview: { useQuery: previewQuery } } },
}));

type Interval = (query: { state: { data: unknown } }) => number | false;

function intervalOf(mock: typeof dataQuery): Interval {
  const [, options] = mock.mock.calls[0];
  return options.refetchInterval;
}

const warming = { ...createFeedArtistResult([createFeedArtistRow()]), warming: true };

beforeEach(() => vi.clearAllMocks());

describe("widget data while the server warms its tags", () => {
  it("polls a saved widget until its feed stops warming", () => {
    useWidgetData(createWidget(), "UTC");
    const interval = intervalOf(dataQuery);

    expect(interval({ state: { data: warming } })).toBe(WARMING_REFETCH_MS);
    expect(interval({ state: { data: createFeedArtistResult([]) } })).toBe(false);
  });

  it("polls the workshop preview the same way", () => {
    const { id: _id, ...draft } = createWidget();
    useWidgetPreview(draft, "UTC");
    const interval = intervalOf(previewQuery);

    expect(interval({ state: { data: warming } })).toBe(WARMING_REFETCH_MS);
    expect(interval({ state: { data: undefined } })).toBe(false);
  });
});
