import { beforeEach, describe, expect, it, vi } from "vitest";

import type { LibraryMovePreview, LibraryPathRecord } from "@hooks/api/queries/library/types";
import { renderWithProviders, screen } from "@test/test-utils";

import type { LibraryFileTarget } from "../../../types";

const state = vi.hoisted(() => ({
  paths: [] as LibraryPathRecord[],
  preview: undefined as LibraryMovePreview | undefined,
  previewInputs: [] as unknown[],
}));

vi.mock("@hooks/api/queries/useLibraryPaths", () => ({
  useLibraryPaths: () => ({ data: state.paths, isLoading: false, isError: false }),
}));

vi.mock("@hooks/api/queries/useLibraryFiles", () => ({
  useLibraryMovePreview: (input: unknown) => {
    state.previewInputs.push(input);
    return { data: input === null ? undefined : state.preview, isLoading: false, isError: false };
  },
}));

import { MoveFilesDialog } from "../MoveFilesDialog";

function path(overrides: Partial<LibraryPathRecord>): LibraryPathRecord {
  return {
    id: "music",
    label: "Music",
    folder: "/music",
    fromEnvironment: true,
    enabled: true,
    isDefault: true,
    namingTemplate: "$albumartist/$album/$track $title",
    access: "writable",
    files: 120,
    sizeBytes: 4_000_000_000,
    freeBytes: 50_000_000_000,
    ruleIds: [],
    lastScanAt: null,
    lastScanOutcome: null,
    ...overrides,
  };
}

const ALBUM: LibraryFileTarget = { scope: "album", albumId: "alb-1", name: "Discovery", pathIds: ["music"] };

const READY: LibraryMovePreview = {
  outcome: "ready",
  tracks: 3,
  bytes: 90_000_000,
  crossDevice: true,
  alreadyThere: 0,
  unmovable: 0,
  splitAlbums: [{ albumId: "alb-2", albumName: "Homework", moving: 2, total: 16 }],
  blocked: [{ albumId: "alb-3", albumName: "Human After All", neededBytes: 400_000_000, freeBytes: 100_000_000 }],
  sample: [{ from: "Daft Punk/Discovery/01 One More Time.flac", to: "Daft Punk/2001 Discovery/01 One More Time.flac" }],
};

const onConfirm = vi.fn();
const onCancel = vi.fn();

function renderDialog(target: LibraryFileTarget = ALBUM) {
  return renderWithProviders(
    <MoveFilesDialog target={target} pending={false} onCancel={onCancel} onConfirm={onConfirm} />
  );
}

describe("MoveFilesDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.previewInputs = [];
    state.preview = READY;
    state.paths = [
      path({}),
      path({ id: "archive", label: "Archive", isDefault: false, fromEnvironment: false }),
      path({ id: "old", label: "Old disk", enabled: false }),
      path({ id: "cd", label: "CD rips", access: "readonly" }),
      path({ id: "nas", label: "NAS", access: "unreachable" }),
    ];
  });

  it("offers only the paths that can take files, and says why the others cannot", () => {
    renderDialog();

    expect(screen.getByRole("radio", { name: /Archive/ })).toBeEnabled();
    expect(screen.getByRole("radio", { name: /Music.*Already here/ })).toBeDisabled();
    expect(screen.getByRole("radio", { name: /Old disk.*Disabled/ })).toBeDisabled();
    expect(screen.getByRole("radio", { name: /CD rips.*Read-only/ })).toBeDisabled();
    expect(screen.getByRole("radio", { name: /NAS.*Not reachable/ })).toBeDisabled();
  });

  it("asks for no preview and offers no move until a path is chosen", () => {
    renderDialog();

    expect(state.previewInputs.every((input) => input === null)).toBe(true);
    expect(screen.getByRole("button", { name: /^Move$/ })).toBeDisabled();
  });

  it("previews the album by id against the chosen path and shows what moves", async () => {
    const { user } = renderDialog();

    await user.click(screen.getByRole("radio", { name: /Archive/ }));

    expect(state.previewInputs.at(-1)).toEqual({
      selection: { trackIds: [], albumIds: ["alb-1"] },
      targetPathId: "archive",
    });
    expect(screen.getByText("3 songs to move")).toBeInTheDocument();
    expect(screen.getByText(/copied, checked, and only then removed/)).toBeInTheDocument();
    expect(screen.getByText("Daft Punk/2001 Discovery/01 One More Time.flac")).toBeInTheDocument();
  });

  it("warns which albums end up split and which stay for lack of space", async () => {
    const { user } = renderDialog();

    await user.click(screen.getByRole("radio", { name: /Archive/ }));

    expect(screen.getByText("2 of 16 songs of Homework move, the rest stay.")).toBeInTheDocument();
    expect(screen.getByText("Not enough space in Archive")).toBeInTheDocument();
    expect(screen.getByText(/Human After All stays where it is/)).toBeInTheDocument();
  });

  it("moves what fits, leaving the blocked albums behind, on confirm", async () => {
    const { user } = renderDialog();

    await user.click(screen.getByRole("radio", { name: /Archive/ }));
    await user.click(screen.getByRole("button", { name: "Move 3 songs" }));

    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ id: "archive", label: "Archive" }));
  });

  it("explains a path that turned unavailable and refuses the move", async () => {
    state.preview = { outcome: "target_unavailable" };
    const { user } = renderDialog();

    await user.click(screen.getByRole("radio", { name: /Archive/ }));

    expect(screen.getByText(/Archive is not available right now/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Move$/ })).toBeDisabled();
  });

  it("refuses the move when nothing in the selection can go", async () => {
    state.preview = { ...READY, tracks: 0, alreadyThere: 2, splitAlbums: [], blocked: [], sample: [] };
    const { user } = renderDialog();

    await user.click(screen.getByRole("radio", { name: /Archive/ }));

    expect(screen.getByText(/Nothing to move/)).toBeInTheDocument();
    expect(screen.getByText("2 songs are already in Archive.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Move$/ })).toBeDisabled();
  });

  it("says so when no path can take the files at all", () => {
    state.paths = [path({})];
    renderDialog();

    expect(screen.getByText(/No other library path can take these songs/)).toBeInTheDocument();
  });

  it("leaves without moving on cancel", async () => {
    const { user } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
