import { describe, expect, it } from "vitest";

import { formatBytes, formatDateTime } from "@utils/formatters";

import { formatErrorParams } from "../params";

describe("formatErrorParams", () => {
  it("returns no values when the server sent none", () => {
    expect(formatErrorParams("QUOTA_STORAGE_EXCEEDED", null)).toEqual({});
  });

  it("formats the byte values a storage refusal declares", () => {
    const formatted = formatErrorParams("QUOTA_STORAGE_EXCEEDED", {
      usedBytes: 2 * 1024 ** 3,
      limitBytes: 10 * 1024 ** 3,
      requestedBytes: 50 * 1024 ** 2,
    });

    expect(formatted).toEqual({
      usedBytes: formatBytes(2 * 1024 ** 3),
      limitBytes: formatBytes(10 * 1024 ** 3),
      requestedBytes: formatBytes(50 * 1024 ** 2),
    });
  });

  it("formats the instant a track refusal frees up as a local date and time", () => {
    const freesAt = "2026-10-02T09:30:00.000Z";
    const formatted = formatErrorParams("QUOTA_TRACKS_EXCEEDED", { used: 50, limit: 50, requested: 1, freesAt });

    expect(formatted).toEqual({ used: 50, limit: 50, requested: 1, freesAt: formatDateTime(new Date(freesAt)) });
  });

  it("passes through a date it cannot read rather than printing an invalid one", () => {
    expect(formatErrorParams("QUOTA_TRACKS_EXCEEDED", { freesAt: "soon" })).toEqual({ freesAt: "soon" });
  });

  it("leaves values alone for a code that declares no formats", () => {
    expect(formatErrorParams("QUOTA_REQUEST_TOO_LARGE", { requested: 80, limit: 50 })).toEqual({
      requested: 80,
      limit: 50,
    });
  });
});
