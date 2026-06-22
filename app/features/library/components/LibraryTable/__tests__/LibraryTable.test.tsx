import { describe, it, expect, vi, beforeEach } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";
import type { ColumnDef } from "@components/ui/Table";
import type { LibraryTrackItem } from "@hooks/api/queries/library/types";
import type { LibrarySelection } from "../../../hooks/useLibrarySelection";
import type { TrackSelectionConfig } from "../types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string, opts?: { count?: number }) => (opts ? `${key}:${opts.count}` : key) }),
}));

const retryFailedMock = vi.hoisted(() => vi.fn());
const useLibraryTrackActionsMock = vi.hoisted(() => vi.fn());

vi.mock("../../../hooks/useLibraryTrackActions", () => ({
  useLibraryTrackActions: useLibraryTrackActionsMock,
}));

vi.mock("../../AddToPlaylistDropdown", () => ({
  AddToPlaylistDropdown: ({ trackIds }: { trackIds: string[] }) => (
    <div data-testid="add-to-playlist">{trackIds.join(",")}</div>
  ),
}));

import { LibraryTable } from "../LibraryTable";

function createTrack(overrides?: Partial<LibraryTrackItem>): LibraryTrackItem {
  return {
    id: "trk-1",
    external_id: "ext-1",
    title: "Aerodynamic",
    artist: "Daft Punk",
    status: "complete",
    source: "deezer",
    format: "flac",
    request_type: "track",
    bitrate: 1411,
    duration_ms: 212000,
    track_number: 3,
    disc_number: 1,
    explicit: false,
    album_id: "alb-1",
    albumName: "Discovery",
    albumArt: null,
    genres: ["electronic"],
    playlistIds: [],
    created_at: new Date("2024-01-01T00:00:00.000Z"),
    completed_at: null,
    ...overrides,
  };
}

const titleColumn: ColumnDef<LibraryTrackItem> = {
  key: "title",
  header: "Track",
  cell: (item) => <span>{item.title}</span>,
};

function makeSelection(overrides?: Partial<LibrarySelection>): LibrarySelection {
  return {
    selectedIds: new Set<string>(),
    selectedCount: 0,
    isSelected: () => false,
    toggle: vi.fn(),
    setMany: vi.fn(),
    clear: vi.fn(),
    selectors: {
      allSelectedOnPage: () => false,
      someSelectedOnPage: () => false,
      filterSelected: () => [],
      selectedFailedIds: () => [],
    },
    ...overrides,
  } as unknown as LibrarySelection;
}

function selectionConfig(selection: LibrarySelection, items: LibraryTrackItem[]): TrackSelectionConfig {
  return { items, selection };
}

describe("LibraryTable", () => {
  beforeEach(() => {
    retryFailedMock.mockReset();
    useLibraryTrackActionsMock.mockReturnValue({ retryFailed: retryFailedMock, isRetrying: false });
  });

  it("renders the data rows without a select column when no selection is provided", () => {
    renderWithProviders(
      <LibraryTable items={[createTrack()]} columns={[titleColumn]} getRowId={(item) => item.id} emptyMessage="empty" />
    );

    expect(screen.getByText("Aerodynamic")).toBeInTheDocument();
    expect(screen.queryByLabelText("page.selection.selectAll")).not.toBeInTheDocument();
  });

  it("adds a select-all header and per-row checkboxes when a selection is provided", () => {
    const items = [createTrack()];
    renderWithProviders(
      <LibraryTable
        items={items}
        columns={[titleColumn]}
        getRowId={(item) => item.id}
        emptyMessage="empty"
        selection={selectionConfig(makeSelection(), items)}
      />
    );

    expect(screen.getByLabelText("page.selection.selectAll")).toBeInTheDocument();
    expect(screen.getByLabelText("page.selection.selectRow")).toBeInTheDocument();
  });

  it("selects every row on the page when the header checkbox is toggled", async () => {
    const items = [createTrack({ id: "a" }), createTrack({ id: "b" })];
    const setMany = vi.fn();
    const selection = makeSelection({ setMany });

    const { user } = renderWithProviders(
      <LibraryTable
        items={items}
        columns={[titleColumn]}
        getRowId={(item) => item.id}
        emptyMessage="empty"
        selection={selectionConfig(selection, items)}
      />
    );

    await user.click(screen.getByLabelText("page.selection.selectAll"));

    expect(setMany).toHaveBeenCalledWith(["a", "b"], true);
  });

  it("toggles a single row when its checkbox is clicked", async () => {
    const items = [createTrack({ id: "a" })];
    const toggle = vi.fn();
    const selection = makeSelection({ toggle });

    const { user } = renderWithProviders(
      <LibraryTable
        items={items}
        columns={[titleColumn]}
        getRowId={(item) => item.id}
        emptyMessage="empty"
        selection={selectionConfig(selection, items)}
      />
    );

    await user.click(screen.getByLabelText("page.selection.selectRow"));

    expect(toggle).toHaveBeenCalledWith("a");
  });

  it("shows the bulk action bar with a retry action when failed tracks are selected", async () => {
    const items = [createTrack({ status: "failed" })];
    const selection = makeSelection({
      selectedCount: 1,
      selectedIds: new Set(["trk-1"]),
      selectors: {
        allSelectedOnPage: () => true,
        someSelectedOnPage: () => true,
        filterSelected: () => ["trk-1"],
        selectedFailedIds: () => ["trk-1"],
      } as unknown as LibrarySelection["selectors"],
    });

    const { user } = renderWithProviders(
      <LibraryTable
        items={items}
        columns={[titleColumn]}
        getRowId={(item) => item.id}
        emptyMessage="empty"
        selection={selectionConfig(selection, items)}
      />
    );

    const retryButton = screen.getByText("page.selection.retryFailed:1");
    await user.click(retryButton);

    expect(retryFailedMock).toHaveBeenCalledWith(["trk-1"]);
  });

  it("renders the add-to-playlist trigger with the selected ids when a selection is active", () => {
    const items = [createTrack()];
    const selection = makeSelection({
      selectedCount: 2,
      selectedIds: new Set(["a", "b"]),
    });

    renderWithProviders(
      <LibraryTable
        items={items}
        columns={[titleColumn]}
        getRowId={(item) => item.id}
        emptyMessage="empty"
        selection={selectionConfig(selection, items)}
      />
    );

    expect(screen.getByTestId("add-to-playlist")).toHaveTextContent("a,b");
  });

  it("hides the bulk action bar when nothing is selected", () => {
    const items = [createTrack()];
    renderWithProviders(
      <LibraryTable
        items={items}
        columns={[titleColumn]}
        getRowId={(item) => item.id}
        emptyMessage="empty"
        selection={selectionConfig(makeSelection(), items)}
      />
    );

    expect(screen.queryByText("page.selection.clear")).not.toBeInTheDocument();
  });
});
