import { describe, expect, it } from "vitest";

import { createFeedArtistResult, createFeedArtistRow, createNewsResult, createTrackResult } from "@test/factories";

import { WARMING_REFETCH_MS } from "../constants";
import { isWarming, warmingRefetch } from "../helpers";

describe("warmingRefetch", () => {
  const warming = { ...createFeedArtistResult([createFeedArtistRow()]), warming: true };

  it("asks again while the server is still reading the tags of a feed", () => {
    expect(isWarming(warming)).toBe(true);
    expect(warmingRefetch({ state: { data: warming } })).toBe(WARMING_REFETCH_MS);
  });

  it("stops asking once the feed settled, and never polls a result that cannot warm", () => {
    expect(warmingRefetch({ state: { data: createFeedArtistResult([]) } })).toBe(false);
    expect(warmingRefetch({ state: { data: createNewsResult([]) } })).toBe(false);
    expect(warmingRefetch({ state: { data: createTrackResult([]) } })).toBe(false);
    expect(warmingRefetch({ state: { data: undefined } })).toBe(false);
  });
});
