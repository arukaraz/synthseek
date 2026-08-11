import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DropImportBatchWithFiles, DropImportFile } from "../types";

const spies = vi.hoisted(() => ({
  batchQuery: { data: undefined as unknown, isLoading: false, isError: false },
  searchQuery: { data: undefined as unknown, isLoading: false, isError: false },
  discardMutate: vi.fn(),
  matchMutate: vi.fn(),
}));

vi.mock("@hooks/api", () => ({
  useDropImportBatch: () => spies.batchQuery,
  useDiscardDropImportFile: () => ({ mutate: spies.discardMutate, isPending: false }),
  useMatchDropImportFile: () => ({ mutate: spies.matchMutate, isPending: false }),
  useSearchContent: () => spies.searchQuery,
}));

import i18n from "@locale";

import { BatchDetail } from "../components/BatchDetail";
import { statusChip } from "../styles";

function makeFile(overrides: Partial<DropImportFile> = {}): DropImportFile {
  return {
    id: "file-1",
    batch_id: "batch-1",
    original_name: "song.mp3",
    status: "imported",
    tag_title: "A Song",
    tag_artist: "An Artist",
    tag_album: null,
    duration_ms: 180000,
    identified_external_id: null,
    error: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

function makeBatch(overrides: Partial<DropImportBatchWithFiles> = {}): DropImportBatchWithFiles {
  return {
    id: "batch-1",
    user_id: "user-1",
    status: "partial",
    total_files: 3,
    imported_files: 1,
    already_in_library_files: 0,
    pending_files: 1,
    failed_files: 1,
    discarded_files: 0,
    created_at: new Date(),
    updated_at: new Date(),
    files: [
      makeFile(),
      makeFile({
        id: "file-2",
        original_name: "mystery.flac",
        status: "pending_match",
        tag_title: null,
        tag_artist: null,
      }),
      makeFile({ id: "file-3", original_name: "broken.wav", status: "failed", error: "identification failed" }),
    ],
    ...overrides,
  };
}

describe("BatchDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.batchQuery.data = makeBatch();
    spies.batchQuery.isLoading = false;
    spies.batchQuery.isError = false;
    spies.searchQuery.data = undefined;
    spies.searchQuery.isLoading = false;
    spies.searchQuery.isError = false;
  });

  it("renders the batch rollup, per-file statuses, and progress", () => {
    render(<BatchDetail batchId="batch-1" rejected={[]} onBack={vi.fn()} />);

    expect(screen.getByText("3/3 files processed")).toBeInTheDocument();
    expect(screen.getByText("Partial")).toBeInTheDocument();
    expect(screen.getByText("1 imported")).toBeInTheDocument();
    expect(screen.getByText("1 needs a match")).toBeInTheDocument();
    expect(screen.getByText("1 failed")).toBeInTheDocument();
    expect(screen.getByText("0 discarded")).toBeInTheDocument();
    expect(screen.getByText(i18n.t("library:dropImport.detail.alreadyInLibrary", { count: 0 }))).toBeInTheDocument();
    expect(screen.getByTestId("progress-bar")).toHaveAttribute("data-progress", "100");

    expect(screen.getByText("song.mp3")).toBeInTheDocument();
    expect(screen.getByText("Imported")).toBeInTheDocument();
    expect(screen.getByText("Needs match")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("identification failed")).toBeInTheDocument();
  });

  it("counts already-in-library files as processed and surfaces them in the summary", () => {
    spies.batchQuery.data = makeBatch({
      status: "completed",
      total_files: 1,
      imported_files: 0,
      already_in_library_files: 1,
      pending_files: 0,
      failed_files: 0,
      files: [makeFile({ original_name: "held.mp3", status: "already_in_library" })],
    });
    render(<BatchDetail batchId="batch-1" rejected={[]} onBack={vi.fn()} />);

    expect(screen.getByText(i18n.t("library:dropImport.detail.title", { processed: 1, total: 1 }))).toBeInTheDocument();
    expect(screen.getByTestId("progress-bar")).toHaveAttribute("data-progress", "100");
    expect(screen.getByText(i18n.t("library:dropImport.detail.alreadyInLibrary", { count: 1 }))).toBeInTheDocument();
  });

  it("renders the already-in-library file status with its own tone", () => {
    spies.batchQuery.data = makeBatch({
      files: [makeFile({ original_name: "held.mp3", status: "already_in_library" })],
    });
    render(<BatchDetail batchId="batch-1" rejected={[]} onBack={vi.fn()} />);

    const badge = screen.getByText(i18n.t("library:dropImport.fileStatus.already_in_library"));

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(...statusChip({ tone: "info" }).split(" "));
  });

  it("discards a pending-match file", async () => {
    const user = userEvent.setup();
    render(<BatchDetail batchId="batch-1" rejected={[]} onBack={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Discard mystery.flac" }));

    expect(spies.discardMutate).toHaveBeenCalledWith({ fileId: "file-2" });
  });

  it("opens the match search panel and assigns a picked track", async () => {
    const user = userEvent.setup();
    spies.searchQuery.data = {
      success: true,
      results: {
        tracks: {
          items: [
            {
              type: "track",
              id: "cat-track-9",
              title: "Found Song",
              artist: "Found Artist",
              artists: [],
              album: { id: "al-1", name: "Found Album", images: [] },
              duration_ms: 200000,
              track_number: 1,
              disc_number: 1,
              isrc: null,
              explicit: false,
              popularity: null,
              preview_url: null,
              images: [],
            },
          ],
          total: 1,
          limit: 10,
          offset: 0,
        },
      },
    };
    render(<BatchDetail batchId="batch-1" rejected={[]} onBack={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Find a match for mystery.flac" }));

    expect(screen.getByRole("searchbox")).toHaveValue("mystery");
    expect(screen.getByText("Found Song")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Use match" }));

    expect(spies.matchMutate).toHaveBeenCalledTimes(1);
    expect(spies.matchMutate.mock.calls[0][0]).toEqual({ fileId: "file-2", externalId: "cat-track-9" });
  });

  it("renders rejected upload entries above the file list", () => {
    render(
      <BatchDetail batchId="batch-1" rejected={[{ name: "notes.txt", reason: "unsupportedType" }]} onBack={vi.fn()} />
    );

    expect(screen.getByText("notes.txt")).toBeInTheDocument();
    expect(screen.getByText("Unsupported file type")).toBeInTheDocument();
  });

  it("navigates back from the header button", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<BatchDetail batchId="batch-1" rejected={[]} onBack={onBack} />);

    await user.click(screen.getByRole("button", { name: "Back to uploads" }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
