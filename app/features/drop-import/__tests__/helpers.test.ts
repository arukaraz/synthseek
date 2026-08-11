import { describe, expect, it } from "vitest";

import {
  batchProcessedCount,
  batchProgressPercent,
  defaultMatchQuery,
  fileDisplayTags,
  stripExtension,
} from "../helpers";
import type { DropImportBatch, DropImportFile } from "../types";

function makeBatch(overrides: Partial<DropImportBatch> = {}): DropImportBatch {
  return {
    id: "batch-1",
    user_id: "user-1",
    status: "completed",
    total_files: 0,
    imported_files: 0,
    already_in_library_files: 0,
    pending_files: 0,
    failed_files: 0,
    discarded_files: 0,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

function makeFile(overrides: Partial<DropImportFile> = {}): DropImportFile {
  return {
    id: "file-1",
    batch_id: "batch-1",
    original_name: "song.mp3",
    status: "imported",
    tag_title: null,
    tag_artist: null,
    tag_album: null,
    duration_ms: null,
    identified_external_id: null,
    error: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

describe("stripExtension", () => {
  it("drops the last extension and keeps dotless names intact", () => {
    expect(stripExtension("song.mp3")).toBe("song");
    expect(stripExtension("my.song.flac")).toBe("my.song");
    expect(stripExtension("noextension")).toBe("noextension");
    expect(stripExtension(".hidden")).toBe(".hidden");
  });
});

describe("defaultMatchQuery", () => {
  it("prefers artist plus title, then title, then the bare filename", () => {
    expect(defaultMatchQuery(makeFile({ tag_artist: "An Artist", tag_title: "A Song" }))).toBe("An Artist A Song");
    expect(defaultMatchQuery(makeFile({ tag_title: "A Song" }))).toBe("A Song");
    expect(defaultMatchQuery(makeFile({ original_name: "mystery.flac" }))).toBe("mystery");
  });
});

describe("fileDisplayTags", () => {
  it("joins artist and title, falls back to title, and yields null with no tags", () => {
    expect(fileDisplayTags(makeFile({ tag_artist: "An Artist", tag_title: "A Song" }))).toBe("An Artist - A Song");
    expect(fileDisplayTags(makeFile({ tag_title: "A Song" }))).toBe("A Song");
    expect(fileDisplayTags(makeFile())).toBeNull();
  });
});

describe("batchProcessedCount", () => {
  it("counts every terminal bucket, including already-in-library files", () => {
    const batch = makeBatch({
      total_files: 5,
      imported_files: 1,
      already_in_library_files: 1,
      pending_files: 1,
      failed_files: 1,
      discarded_files: 1,
    });

    expect(batchProcessedCount(batch)).toBe(5);
  });

  it("treats a fully skipped batch as fully processed", () => {
    const batch = makeBatch({ total_files: 2, already_in_library_files: 2 });

    expect(batchProcessedCount(batch)).toBe(2);
  });
});

describe("batchProgressPercent", () => {
  it("reports 100 percent for a fully skipped batch", () => {
    expect(batchProgressPercent(makeBatch({ total_files: 2, already_in_library_files: 2 }))).toBe(100);
  });

  it("rounds partial progress and guards an empty batch", () => {
    expect(batchProgressPercent(makeBatch({ total_files: 3, imported_files: 1 }))).toBe(33);
    expect(batchProgressPercent(makeBatch())).toBe(0);
  });
});
