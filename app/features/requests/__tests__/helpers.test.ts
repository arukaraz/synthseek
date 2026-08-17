import { ContentType, RequestStatus, type RequestListItem } from "@api/__generated__/types";
import { describe, expect, it } from "vitest";

import { compareByStatus, exportFilename, filterRequestsByStatus, hasActiveDownload } from "../helpers";
import { makeRequestListItem } from "./factories";

describe("hasActiveDownload", () => {
  it("is true when an album is actively downloading", () => {
    const items = [
      makeRequestListItem({
        contentType: ContentType.enum.album,
        status: RequestStatus.enum.downloading,
      }),
    ];

    expect(hasActiveDownload(items)).toBe(true);
  });

  it("is false when an album has a terminal status", () => {
    const items = [
      makeRequestListItem({
        contentType: ContentType.enum.album,
        status: RequestStatus.enum.complete,
      }),
    ];

    expect(hasActiveDownload(items)).toBe(false);
  });

  it("is false for undefined input", () => {
    expect(hasActiveDownload(undefined)).toBe(false);
  });
});

describe("exportFilename", () => {
  it("slugifies a name and appends the jspf extension", () => {
    expect(exportFilename("My Favourite Songs!")).toBe("my-favourite-songs.jspf");
  });

  it("collapses runs of non-alphanumeric characters into single hyphens", () => {
    expect(exportFilename("Rock & Roll -- Vol. 2")).toBe("rock-roll-vol-2.jspf");
  });

  it("trims leading and trailing separators from the slug", () => {
    expect(exportFilename("  ***Edge***  ")).toBe("edge.jspf");
  });

  it("falls back to playlist when the name has no usable characters", () => {
    expect(exportFilename("!!!")).toBe("playlist.jspf");
  });
});

const complete = makeRequestListItem({ id: "complete", status: RequestStatus.enum.complete });
const failed = makeRequestListItem({ id: "failed", status: RequestStatus.enum.failed });
const downloading = makeRequestListItem({ id: "downloading", status: RequestStatus.enum.downloading });
const pending = makeRequestListItem({ id: "pending", status: RequestStatus.enum.pending_approval });

describe("filterRequestsByStatus", () => {
  const items: RequestListItem[] = [complete, failed];

  it("returns every item for the all filter", () => {
    expect(filterRequestsByStatus(items, "all").map((item) => item.id)).toEqual(["complete", "failed"]);
  });

  it("keeps only in-flight items for the active filter", () => {
    expect(filterRequestsByStatus([downloading, complete, failed], "active").map((item) => item.id)).toEqual([
      "downloading",
    ]);
  });

  it("keeps only resolved items for the done filter", () => {
    expect(filterRequestsByStatus(items, "done").map((item) => item.id)).toEqual(["complete"]);
  });

  it("keeps only failing items for the failed filter", () => {
    expect(filterRequestsByStatus(items, "failed").map((item) => item.id)).toEqual(["failed"]);
  });

  it("returns an empty array for undefined input", () => {
    expect(filterRequestsByStatus(undefined, "done")).toEqual([]);
  });
});

describe("compareByStatus", () => {
  it("orders an active status ahead of a resolved one", () => {
    expect(compareByStatus(RequestStatus.enum.downloading, RequestStatus.enum.complete)).toBeLessThan(0);
  });

  it("returns zero when comparing a status with itself", () => {
    expect(compareByStatus(RequestStatus.enum.complete, RequestStatus.enum.complete)).toBe(0);
  });
});

describe("pending_approval placement", () => {
  it("keeps only the waiting items for the pending_approval filter", () => {
    const mixed = [pending, downloading, complete, failed];

    expect(filterRequestsByStatus(mixed, "pending_approval").map((item) => item.id)).toEqual(["pending"]);
  });

  it("is excluded from the active filter so active means moving", () => {
    const mixed = [pending, downloading];

    expect(filterRequestsByStatus(mixed, "active").map((item) => item.id)).toEqual(["downloading"]);
  });

  it("is excluded from done and failed and still included in all", () => {
    expect(filterRequestsByStatus([pending], "done")).toEqual([]);
    expect(filterRequestsByStatus([pending], "failed")).toEqual([]);
    expect(filterRequestsByStatus([pending], "all").map((item) => item.id)).toEqual(["pending"]);
  });

  it("sorts ahead of every other status", () => {
    expect(compareByStatus(RequestStatus.enum.pending_approval, RequestStatus.enum.downloading)).toBeLessThan(0);
    expect(compareByStatus(RequestStatus.enum.pending_approval, RequestStatus.enum.failed)).toBeLessThan(0);
  });
});
