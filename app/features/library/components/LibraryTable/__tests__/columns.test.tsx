import { describe, expect, it, vi } from "vitest";

import type { LibraryTrackItem } from "@hooks/api/queries/library/types";
import { render, screen } from "@test/test-utils";

import { buildTrackColumns } from "../columns";

function track(libraryPath: LibraryTrackItem["libraryPath"]): LibraryTrackItem {
  return {
    id: "trk-1",
    external_id: "ext-1",
    title: "Aerodynamic",
    artist: "Daft Punk",
    status: "complete",
    source: "local",
    format: "flac",
    request_type: "track",
    bitrate: 1411,
    file_bitrate: null,
    file_format: null,
    playable: true,
    sources: [],
    duration_ms: 212000,
    track_number: 3,
    disc_number: 1,
    explicit: false,
    album_id: "alb-1",
    albumName: "Discovery",
    albumArt: null,
    genres: [],
    playlistIds: [],
    replayGain: { trackGain: null, albumGain: null, trackPeak: null, albumPeak: null },
    libraryPath,
    created_at: new Date("2024-01-01T00:00:00.000Z"),
    completed_at: null,
  };
}

function columnsWith(showLibraryPath: boolean) {
  return buildTrackColumns({
    onPlay: vi.fn(),
    onEnqueue: vi.fn(async () => true),
    onSearchBetterQuality: vi.fn(),
    fileActions: { canMove: true, openMove: vi.fn(), openDelete: vi.fn() },
    showLibraryPath,
  });
}

function libraryPathColumn() {
  const columns = columnsWith(true);
  const column = columns.find((entry) => entry.key === "libraryPath");
  if (column === undefined) throw new Error("the library path column is missing");
  return { columns, column };
}

describe("buildTrackColumns", () => {
  it("leaves the Library path column out when the library has only one path", () => {
    expect(columnsWith(false).map((entry) => entry.key)).not.toContain("libraryPath");
  });

  it("hides the Library path column on narrow screens", () => {
    expect(libraryPathColumn().column.className).toContain("hidden");
    expect(libraryPathColumn().column.className).toContain("md:table-cell");
  });

  it("adds a Library path column before the length", () => {
    const { columns, column } = libraryPathColumn();

    expect(column.header).toBe("Library path");
    expect(columns.map((entry) => entry.key).indexOf("libraryPath")).toBe(
      columns.map((entry) => entry.key).indexOf("length") - 1
    );
  });

  it("shows the label of the path the file sits in", () => {
    const { column } = libraryPathColumn();
    render(<>{column.cell(track({ id: "archive", label: "Archive" }))}</>);

    expect(screen.getByText("Archive")).toBeInTheDocument();
  });

  it("shows a placeholder for a track not in the library", () => {
    const { column } = libraryPathColumn();
    render(<>{column.cell(track(null))}</>);

    expect(screen.getByText("--")).toBeInTheDocument();
  });

  it("replaces the old queue button column with the actions menu", () => {
    const { columns } = libraryPathColumn();
    const keys = columns.map((entry) => entry.key);

    expect(keys).toContain("actions");
    expect(keys).not.toContain("queue");
  });
});
