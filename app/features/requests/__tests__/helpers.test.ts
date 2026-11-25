import { RequestStatus } from "@api/__generated__/types";
import { describe, expect, it } from "vitest";

import { compareByStatus, exportFilename } from "../helpers";

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

describe("compareByStatus", () => {
  it("orders an active status ahead of a resolved one", () => {
    expect(compareByStatus(RequestStatus.enum.downloading, RequestStatus.enum.complete)).toBeLessThan(0);
  });

  it("returns zero when comparing a status with itself", () => {
    expect(compareByStatus(RequestStatus.enum.complete, RequestStatus.enum.complete)).toBe(0);
  });
});

describe("pending_approval placement", () => {
  it("sorts ahead of every other status", () => {
    expect(compareByStatus(RequestStatus.enum.pending_approval, RequestStatus.enum.downloading)).toBeLessThan(0);
    expect(compareByStatus(RequestStatus.enum.pending_approval, RequestStatus.enum.failed)).toBeLessThan(0);
  });
});
