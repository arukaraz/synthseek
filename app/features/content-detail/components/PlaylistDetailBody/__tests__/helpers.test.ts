import { describe, expect, it } from "vitest";

import type { RequestStatus } from "@api/__generated__/types";
import type { TracklistTrack } from "../../Tracklist/types";
import { isTracklistSortKey, sortTracklist } from "../helpers";

function track(title: string, durationMs: number, status: RequestStatus | null): TracklistTrack {
  return {
    externalId: title,
    title,
    artist: "Artist",
    durationMs,
    trackNumber: 1,
    plays: null,
    inLibrary: false,
    requestId: title,
    slskd_request_id: null,
    status,
    failureReason: null,
  };
}

const tracks: TracklistTrack[] = [
  track("Banana", 3000, "complete"),
  track("apple", 1000, "failed"),
  track("Cherry", 2000, "downloading"),
];

function titles(list: TracklistTrack[]): string[] {
  return list.map((entry) => entry.title);
}

describe("sortTracklist", () => {
  it("sorts by name ascending and descending", () => {
    expect(titles(sortTracklist(tracks, "name", "asc"))).toEqual(["apple", "Banana", "Cherry"]);
    expect(titles(sortTracklist(tracks, "name", "desc"))).toEqual(["Cherry", "Banana", "apple"]);
  });

  it("sorts by length using the track duration", () => {
    expect(titles(sortTracklist(tracks, "length", "asc"))).toEqual(["apple", "Cherry", "Banana"]);
  });

  it("sorts by status using the configured order", () => {
    expect(titles(sortTracklist(tracks, "status", "asc"))).toEqual(["apple", "Cherry", "Banana"]);
  });

  it("does not mutate the input array", () => {
    const input = [...tracks];
    sortTracklist(input, "name", "asc");
    expect(titles(input)).toEqual(["Banana", "apple", "Cherry"]);
  });
});

describe("isTracklistSortKey", () => {
  it("accepts known keys and rejects others", () => {
    expect(isTracklistSortKey("name")).toBe(true);
    expect(isTracklistSortKey("status")).toBe(true);
    expect(isTracklistSortKey("length")).toBe(true);
    expect(isTracklistSortKey("bogus")).toBe(false);
  });
});
