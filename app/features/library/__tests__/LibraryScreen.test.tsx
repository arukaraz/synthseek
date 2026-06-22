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

import { VIEW_CONFIG } from "../constants";
import { LibraryScreen } from "../LibraryScreen";
import type { LibraryView } from "../types";

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
    expect(setTabMock).toHaveBeenCalledWith("albums");
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
});
