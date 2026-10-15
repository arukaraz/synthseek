import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { Fragment, type KeyboardEvent, type ReactNode } from "react";

import { renderWithProviders, screen, within } from "@test/test-utils";
import type { LibraryAlbumItem } from "@hooks/api/queries/library/types";
import { useSelection } from "@hooks/ui/useSelection";
import type { AlbumsViewModeProps } from "../../types";

import { AlbumsViewMode } from "../AlbumsViewMode";

const openForResultMock = vi.hoisted(() => vi.fn());
const albumRequestItemMock = vi.hoisted(() => vi.fn((input: unknown) => ({ type: "album", input })));
const useLibraryAlbumsMock = vi.hoisted(() => vi.fn());
const playback = vi.hoisted(() => ({
  playEntity: vi.fn(async () => undefined),
  enqueueEntity: vi.fn(async () => true),
  enqueueEntities: vi.fn(async () => true),
}));
const auth = vi.hoisted(() => ({ isAdmin: false }));

vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ openForResult: openForResultMock }),
}));

vi.mock("@features/content-detail", () => ({
  albumRequestItem: albumRequestItemMock,
}));

vi.mock("@hooks/api", () => ({
  useLibraryAlbums: useLibraryAlbumsMock,
}));

vi.mock("@hooks/ui/useEntityPlayback", () => ({
  useEntityPlayback: () => playback,
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin: auth.isAdmin, currentUser: null, isLoading: false }),
}));

vi.mock("../LibraryViewLayout/LibraryViewLayout", () => ({
  LibraryViewLayout: ({
    items,
    content,
  }: {
    items: LibraryAlbumItem[] | undefined;
    content: {
      renderCard: (item: LibraryAlbumItem) => ReactNode;
      bulkBar?: ReactNode;
      onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
    };
  }) => (
    <div onKeyDown={content.onKeyDown}>
      {content.bulkBar}
      <ul>
        {(items ?? []).map((item) => (
          <Fragment key={item.id}>{content.renderCard(item)}</Fragment>
        ))}
      </ul>
    </div>
  ),
}));

function createAlbum(overrides?: Partial<LibraryAlbumItem>): LibraryAlbumItem {
  return {
    id: "row-1",
    external_id: "ext-1",
    name: "Discovery",
    artist: "Daft Punk",
    album_art: null,
    status: "complete",
    total_tracks: 14,
    completed_tracks: 14,
    source_provider: null,
    release_date: "2001-03-12",
    genres: ["electronic"],
    year: 2001,
    quality: "FLAC",
    requested: true,
    libraryPaths: [{ id: "music", label: "Music" }],
    created_at: new Date("2001-03-12T00:00:00.000Z"),
    ...overrides,
  };
}

const fileActions = { canMove: true, openMove: vi.fn(), openDelete: vi.fn() };

function makeProps(): Omit<AlbumsViewModeProps, "selection"> {
  return {
    controller: {
      view: "albums",
      search: "",
      sort: "recent",
      direction: undefined,
      filters: {},
      facetSearch: {},
    } as unknown as AlbumsViewModeProps["controller"],
    filtersOpen: false,
    onFiltersOpenChange: vi.fn(),
    fileActions,
  };
}

function AlbumsHarness() {
  const selection = useSelection<LibraryAlbumItem>();
  return <AlbumsViewMode {...makeProps()} selection={selection} />;
}

function showAlbums(items: LibraryAlbumItem[]) {
  useLibraryAlbumsMock.mockReturnValue({
    items,
    total: items.length,
    facets: {},
    isLoading: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
  });
}

const THREE_ALBUMS = [
  createAlbum({ id: "row-1", external_id: "ext-1", name: "Discovery" }),
  createAlbum({ id: "row-2", external_id: "ext-2", name: "Homework", libraryPaths: [] }),
  createAlbum({
    id: "row-3",
    external_id: "ext-3",
    name: "Alive",
    libraryPaths: [{ id: "archive", label: "Archive" }],
  }),
];

describe("AlbumsViewMode", () => {
  beforeEach(() => {
    auth.isAdmin = false;
    openForResultMock.mockReset();
    albumRequestItemMock.mockClear();
    useLibraryAlbumsMock.mockReturnValue({
      items: [createAlbum()],
      total: 1,
      facets: {},
      isLoading: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("opens the album detail flow with the mapped request item on card click", async () => {
    const { user } = renderWithProviders(<AlbumsHarness />);

    await user.click(screen.getByRole("button", { name: /Open details for/i }));

    expect(albumRequestItemMock).toHaveBeenCalledWith({
      id: "ext-1",
      name: "Discovery",
      artistName: "Daft Punk",
      cover: null,
      genres: ["electronic"],
    });
    expect(openForResultMock).toHaveBeenCalledTimes(1);
  });

  it("plays the album from the play button without opening its detail", async () => {
    const { user } = renderWithProviders(<AlbumsHarness />);

    await user.click(screen.getByRole("button", { name: /Play everything we have of Discovery/i }));

    expect(playback.playEntity).toHaveBeenCalledWith({ kind: "album", albumExternalId: "ext-1" });
    expect(openForResultMock).not.toHaveBeenCalled();
  });

  it("queues the album from its menu without opening its detail", async () => {
    const { user } = renderWithProviders(<AlbumsHarness />);

    await user.click(screen.getByRole("button", { name: /More actions for Discovery/i }));
    await user.click(screen.getByRole("menuitem", { name: /Add to queue/i }));

    expect(playback.enqueueEntity).toHaveBeenCalledWith({ kind: "album", albumExternalId: "ext-1" });
    expect(openForResultMock).not.toHaveBeenCalled();
  });

  it("keeps move and delete out of a member's album menu", async () => {
    const { user } = renderWithProviders(<AlbumsHarness />);

    await user.click(screen.getByRole("button", { name: /More actions for Discovery/i }));

    expect(screen.queryByRole("menuitem", { name: /Move to path/i })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: /Delete files/i })).toBeNull();
  });

  it("sends an admin's album move by album id, with the paths it lives in", async () => {
    auth.isAdmin = true;
    const { user } = renderWithProviders(<AlbumsHarness />);

    await user.click(screen.getByRole("button", { name: /More actions for Discovery/i }));
    await user.click(screen.getByRole("menuitem", { name: /Move to path/i }));

    expect(fileActions.openMove).toHaveBeenCalledWith({
      scope: "album",
      albumId: "row-1",
      name: "Discovery",
      pathIds: ["music"],
    });
    expect(openForResultMock).not.toHaveBeenCalled();
  });

  it("disables an admin's move and delete for an album with nothing in the library", async () => {
    auth.isAdmin = true;
    useLibraryAlbumsMock.mockReturnValue({
      items: [createAlbum({ libraryPaths: [] })],
      total: 1,
      facets: {},
      isLoading: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });
    const { user } = renderWithProviders(<AlbumsHarness />);

    await user.click(screen.getByRole("button", { name: /More actions for Discovery/i }));

    expect(screen.getByRole("menuitem", { name: /Move to path/i })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("menuitem", { name: /Delete files/i })).toHaveAttribute("aria-disabled", "true");
  });

  it("gates the album query on the active view being albums", () => {
    renderWithProviders(<AlbumsHarness />);

    expect(useLibraryAlbumsMock).toHaveBeenCalledWith(expect.anything(), true);
  });

  describe("selecting albums", () => {
    beforeEach(() => showAlbums(THREE_ALBUMS));

    it("shows no bulk bar until an album is ticked", async () => {
      const { user } = renderWithProviders(<AlbumsHarness />);

      expect(screen.queryByRole("status")).toBeNull();

      await user.click(screen.getByRole("checkbox", { name: "Select Discovery" }));

      expect(screen.getByRole("status")).toHaveTextContent("1selected");
      expect(screen.getByRole("checkbox", { name: "Select Discovery" })).toHaveAttribute("data-state", "checked");
    });

    it("toggles a card on click once selecting, instead of opening its detail", async () => {
      const { user } = renderWithProviders(<AlbumsHarness />);

      await user.click(screen.getByRole("checkbox", { name: "Select Discovery" }));
      await user.click(screen.getByText("Homework"));

      expect(screen.getByRole("status")).toHaveTextContent("2selected");
      expect(openForResultMock).not.toHaveBeenCalled();

      await user.click(screen.getByText("Homework"));

      expect(screen.getByRole("status")).toHaveTextContent("1selected");
      expect(openForResultMock).not.toHaveBeenCalled();
    });

    it("goes back to opening the detail once the selection is cleared", async () => {
      const { user } = renderWithProviders(<AlbumsHarness />);

      await user.click(screen.getByRole("checkbox", { name: "Select Discovery" }));
      await user.click(screen.getByRole("button", { name: "Clear" }));
      await user.click(screen.getByText("Homework"));

      expect(screen.queryByRole("status")).toBeNull();
      expect(openForResultMock).toHaveBeenCalledTimes(1);
    });

    it("paints the shown range on a shift click", async () => {
      const { user } = renderWithProviders(<AlbumsHarness />);

      await user.click(screen.getByRole("checkbox", { name: "Select Discovery" }));
      await user.keyboard("{Shift>}");
      await user.click(screen.getByText("Alive"));
      await user.keyboard("{/Shift}");

      expect(screen.getByRole("status")).toHaveTextContent("3selected");
    });

    it("selects every shown album from the bar and with Ctrl+A, and clears with Escape", async () => {
      const { user } = renderWithProviders(<AlbumsHarness />);

      await user.click(screen.getByRole("checkbox", { name: "Select Discovery" }));
      await user.click(screen.getByRole("button", { name: "Select all shown" }));

      expect(screen.getByRole("status")).toHaveTextContent("3selected");
      expect(screen.queryByRole("button", { name: "Select all shown" })).toBeNull();

      screen.getByRole("button", { name: "Select Homework" }).focus();
      await user.keyboard("{Escape}");

      expect(screen.queryByRole("status")).toBeNull();

      screen.getByRole("checkbox", { name: "Select Alive" }).focus();
      await user.keyboard("{Control>}a{/Control}");

      expect(screen.getByRole("status")).toHaveTextContent("3selected");
    });

    it("sends an admin's bulk move by album id, leaving out albums with nothing in the library", async () => {
      auth.isAdmin = true;
      const { user } = renderWithProviders(<AlbumsHarness />);

      await user.click(screen.getByRole("checkbox", { name: "Select Discovery" }));
      await user.click(screen.getByText("Homework"));
      await user.click(screen.getByText("Alive"));
      await user.click(screen.getByRole("button", { name: "Move to path…" }));

      expect(fileActions.openMove).toHaveBeenCalledWith({
        scope: "albums",
        albumIds: ["row-1", "row-3"],
        pathIds: ["music", "archive"],
      });
      expect(openForResultMock).not.toHaveBeenCalled();
    });

    it("sends an admin's bulk delete by album id", async () => {
      auth.isAdmin = true;
      const { user } = renderWithProviders(<AlbumsHarness />);

      await user.click(screen.getByRole("checkbox", { name: "Select Discovery" }));
      await user.click(screen.getByText("Alive"));
      await user.click(screen.getByRole("button", { name: "Delete files" }));

      expect(fileActions.openDelete).toHaveBeenCalledWith({
        scope: "albums",
        albumIds: ["row-1", "row-3"],
        pathIds: ["music", "archive"],
      });
    });

    it("offers an admin no move or delete when no selected album is in the library", async () => {
      auth.isAdmin = true;
      const { user } = renderWithProviders(<AlbumsHarness />);

      await user.click(screen.getByRole("checkbox", { name: "Select Homework" }));

      expect(screen.queryByRole("button", { name: "Move to path…" })).toBeNull();
      expect(screen.queryByRole("button", { name: "Delete files" })).toBeNull();
    });

    it("keeps move and delete out of a member's bulk bar while still offering the queue", async () => {
      const { user } = renderWithProviders(<AlbumsHarness />);

      await user.click(screen.getByRole("checkbox", { name: "Select Discovery" }));
      await user.click(screen.getByText("Alive"));

      expect(screen.getByRole("button", { name: "Add 2 to the queue" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Move to path…" })).toBeNull();
      expect(screen.queryByRole("button", { name: "Delete files" })).toBeNull();
    });

    it("queues every selected album at once and clears the selection once they are in", async () => {
      const { user } = renderWithProviders(<AlbumsHarness />);

      await user.click(screen.getByRole("checkbox", { name: "Select Discovery" }));
      await user.click(screen.getByText("Alive"));
      await user.click(screen.getByRole("button", { name: "Add 2 to the queue" }));

      expect(playback.enqueueEntities).toHaveBeenCalledWith([
        { kind: "album", albumExternalId: "ext-1" },
        { kind: "album", albumExternalId: "ext-3" },
      ]);
      expect(screen.queryByRole("status")).toBeNull();
    });

    it("keeps the selection when nothing could be queued", async () => {
      playback.enqueueEntities.mockResolvedValueOnce(false);
      const { user } = renderWithProviders(<AlbumsHarness />);

      await user.click(screen.getByRole("checkbox", { name: "Select Discovery" }));
      await user.click(screen.getByRole("button", { name: "Add 1 to the queue" }));

      expect(screen.getByRole("status")).toHaveTextContent("1selected");
    });

    it("only plays from a card's play button while selecting", async () => {
      const { user } = renderWithProviders(<AlbumsHarness />);

      await user.click(screen.getByRole("checkbox", { name: "Select Discovery" }));
      const alive = screen.getByRole("button", { name: "Select Alive" });
      await user.click(within(alive).getByRole("button", { name: /Play everything we have of Alive/i }));

      expect(playback.playEntity).toHaveBeenCalledWith({ kind: "album", albumExternalId: "ext-3" });
      expect(screen.getByRole("status")).toHaveTextContent("1selected");
    });
  });
});
