import { describe, it, expect, vi, beforeEach } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";
import type { LibraryUrlController } from "../hooks/useLibraryUrlState";
import type { LibrarySelection } from "../hooks/useLibrarySelection";

const controllerMock = vi.hoisted(() => ({ current: undefined as unknown as LibraryUrlController }));
const selectionClearMock = vi.hoisted(() => vi.fn());
const setTabMock = vi.hoisted(() => vi.fn());

vi.mock("../hooks/useLibraryUrlState", () => ({
  useLibraryUrlState: () => controllerMock.current,
}));

vi.mock("../hooks/useLibrarySelection", () => ({
  useLibrarySelection: () => ({ clear: selectionClearMock }) as unknown as LibrarySelection,
}));

const albumSelectionClearMock = vi.hoisted(() => vi.fn());

vi.mock("@hooks/ui/useSelection", () => ({
  useSelection: () => ({ clear: albumSelectionClearMock }),
}));

vi.mock("../components/LibraryToolbar/LibraryToolbar", () => ({
  LibraryToolbar: ({
    onViewChange,
    onSearchChange,
    onOpenFilters,
  }: {
    onViewChange: (view: string) => void;
    onSearchChange: (value: string) => void;
    onOpenFilters: () => void;
  }) => (
    <>
      <button type="button" onClick={() => onViewChange("albums")}>
        change-view
      </button>
      <button type="button" onClick={() => onSearchChange("query")}>
        change-search
      </button>
      <button type="button" onClick={onOpenFilters}>
        open-filters
      </button>
    </>
  ),
}));

vi.mock("../components/TracksViewMode", () => ({ TracksViewMode: () => <div>tracks-view</div> }));
vi.mock("../components/AlbumsViewMode", () => ({ AlbumsViewMode: () => <div>albums-view</div> }));
vi.mock("../components/ArtistsViewMode", () => ({ ArtistsViewMode: () => <div>artists-view</div> }));
vi.mock("../components/PlaylistsViewMode", () => ({ PlaylistsViewMode: () => <div>playlists-view</div> }));

vi.mock("@modules/providers/AuthProvider", () => ({ useAuthContext: () => ({ isAdmin: true }) }));
vi.mock("@hooks/api/queries/useLibraryPaths", () => ({ useLibraryPaths: () => ({ data: undefined }) }));

vi.mock("../components/LibraryFileFlow", () => ({
  LibraryFileFlow: ({ onStarted }: { onStarted: (request: LibraryFileRequest) => void }) => (
    <>
      <button
        type="button"
        onClick={() =>
          onStarted({ kind: "move", target: { scope: "tracks", trackIds: ["a", "b"], pathIds: ["music"] } })
        }
      >
        bulk-move-started
      </button>
      <button
        type="button"
        onClick={() =>
          onStarted({ kind: "move", target: { scope: "track", trackId: "a", title: "A", pathIds: ["music"] } })
        }
      >
        row-move-started
      </button>
      <button
        type="button"
        onClick={() =>
          onStarted({ kind: "delete", target: { scope: "track", trackId: "a", title: "A", pathIds: ["music"] } })
        }
      >
        row-delete-started
      </button>
      <button
        type="button"
        onClick={() =>
          onStarted({ kind: "move", target: { scope: "albums", albumIds: ["x", "y"], pathIds: ["music"] } })
        }
      >
        albums-move-started
      </button>
      <button
        type="button"
        onClick={() =>
          onStarted({ kind: "move", target: { scope: "album", albumId: "x", name: "X", pathIds: ["music"] } })
        }
      >
        album-move-started
      </button>
    </>
  ),
}));

import { VIEW_CONFIG } from "../constants";
import { LibraryScreen } from "../LibraryScreen";
import type { LibraryFileRequest, LibraryView } from "../types";

const setSearchMock = vi.hoisted(() => vi.fn());

function makeController(view: LibraryView): LibraryUrlController {
  return {
    view,
    config: VIEW_CONFIG[view],
    search: "",
    filters: {},
    setSearch: setSearchMock,
    setTab: setTabMock,
  } as unknown as LibraryUrlController;
}

describe("LibraryScreen", () => {
  beforeEach(() => {
    selectionClearMock.mockReset();
    albumSelectionClearMock.mockReset();
    setTabMock.mockReset();
    setSearchMock.mockReset();
  });

  it("renders only the tracks view for the tracks tab", () => {
    controllerMock.current = makeController("tracks");
    renderWithProviders(<LibraryScreen />);

    expect(screen.getByText("tracks-view")).toBeInTheDocument();
    expect(screen.queryByText("albums-view")).not.toBeInTheDocument();
  });

  it("renders only the albums view for the albums tab", () => {
    controllerMock.current = makeController("albums");
    renderWithProviders(<LibraryScreen />);

    expect(screen.getByText("albums-view")).toBeInTheDocument();
    expect(screen.queryByText("tracks-view")).not.toBeInTheDocument();
  });

  it("renders only the artists view for the artists tab", () => {
    controllerMock.current = makeController("artists");
    renderWithProviders(<LibraryScreen />);

    expect(screen.getByText("artists-view")).toBeInTheDocument();
  });

  it("renders only the playlists view for the playlists tab", () => {
    controllerMock.current = makeController("playlists");
    renderWithProviders(<LibraryScreen />);

    expect(screen.getByText("playlists-view")).toBeInTheDocument();
  });

  it("clears the selection and switches the tab when the view changes", async () => {
    controllerMock.current = makeController("tracks");
    const { user } = renderWithProviders(<LibraryScreen />);

    await user.click(screen.getByRole("button", { name: "change-view" }));

    expect(selectionClearMock).toHaveBeenCalledTimes(1);
    expect(albumSelectionClearMock).toHaveBeenCalledTimes(1);
    expect(setTabMock).toHaveBeenCalledWith("albums");
  });

  it("clears the album selection once a move of the selected albums has started", async () => {
    controllerMock.current = makeController("albums");
    const { user } = renderWithProviders(<LibraryScreen />);

    await user.click(screen.getByRole("button", { name: "albums-move-started" }));

    expect(albumSelectionClearMock).toHaveBeenCalledTimes(1);
  });

  it("keeps the album selection when one album's own menu moves it", async () => {
    controllerMock.current = makeController("albums");
    const { user } = renderWithProviders(<LibraryScreen />);

    await user.click(screen.getByRole("button", { name: "album-move-started" }));

    expect(albumSelectionClearMock).not.toHaveBeenCalled();
  });

  it("wires the toolbar search change into the controller's setSearch", async () => {
    controllerMock.current = makeController("tracks");
    const { user } = renderWithProviders(<LibraryScreen />);

    await user.click(screen.getByRole("button", { name: "change-search" }));

    expect(setSearchMock).toHaveBeenCalledWith("query");
  });

  it("opens the mobile filter sheet without affecting the rendered view", async () => {
    controllerMock.current = makeController("tracks");
    const { user } = renderWithProviders(<LibraryScreen />);

    await user.click(screen.getByRole("button", { name: "open-filters" }));

    expect(screen.getByText("tracks-view")).toBeInTheDocument();
  });

  it("clears the selection once a move of the selected rows has started", async () => {
    controllerMock.current = makeController("tracks");
    const { user } = renderWithProviders(<LibraryScreen />);

    await user.click(screen.getByRole("button", { name: "bulk-move-started" }));

    expect(selectionClearMock).toHaveBeenCalledTimes(1);
  });

  it("keeps the selection when one row's own menu moves it", async () => {
    controllerMock.current = makeController("tracks");
    const { user } = renderWithProviders(<LibraryScreen />);

    await user.click(screen.getByRole("button", { name: "row-move-started" }));

    expect(selectionClearMock).not.toHaveBeenCalled();
  });

  it("clears the selection once a delete has started, since deleted rows leave the list", async () => {
    controllerMock.current = makeController("tracks");
    const { user } = renderWithProviders(<LibraryScreen />);

    await user.click(screen.getByRole("button", { name: "row-delete-started" }));

    expect(selectionClearMock).toHaveBeenCalledTimes(1);
  });
});
