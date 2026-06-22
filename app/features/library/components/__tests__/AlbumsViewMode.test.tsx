import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ReactNode } from "react";

import { renderWithProviders, screen } from "@test/test-utils";
import type { LibraryAlbumItem } from "@hooks/api/queries/library/types";
import type { LibraryViewModeProps } from "../../types";

import { AlbumsViewMode } from "../AlbumsViewMode";

const openForResultMock = vi.hoisted(() => vi.fn());
const albumRequestItemMock = vi.hoisted(() => vi.fn((input: unknown) => ({ type: "album", input })));
const useLibraryAlbumsMock = vi.hoisted(() => vi.fn());

vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ openForResult: openForResultMock }),
}));

vi.mock("@features/content-detail", () => ({
  albumRequestItem: albumRequestItemMock,
}));

vi.mock("@hooks/api", () => ({
  useLibraryAlbums: useLibraryAlbumsMock,
}));

vi.mock("../LibraryViewLayout/LibraryViewLayout", () => ({
  LibraryViewLayout: ({
    items,
    content,
  }: {
    items: LibraryAlbumItem[] | undefined;
    content: { renderCard: (item: LibraryAlbumItem) => ReactNode };
  }) => <div>{(items ?? []).map((item) => content.renderCard(item))}</div>,
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
    created_at: new Date("2001-03-12T00:00:00.000Z"),
    ...overrides,
  };
}

function makeProps(): LibraryViewModeProps {
  return {
    controller: {
      view: "albums",
      search: "",
      sort: "recent",
      direction: undefined,
      filters: {},
      facetSearch: {},
    } as unknown as LibraryViewModeProps["controller"],
    filtersOpen: false,
    onFiltersOpenChange: vi.fn(),
  };
}

describe("AlbumsViewMode", () => {
  beforeEach(() => {
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
    const { user } = renderWithProviders(<AlbumsViewMode {...makeProps()} />);

    await user.click(screen.getByRole("button"));

    expect(albumRequestItemMock).toHaveBeenCalledWith({
      id: "ext-1",
      name: "Discovery",
      artistName: "Daft Punk",
      cover: null,
      genres: ["electronic"],
    });
    expect(openForResultMock).toHaveBeenCalledTimes(1);
  });

  it("gates the album query on the active view being albums", () => {
    renderWithProviders(<AlbumsViewMode {...makeProps()} />);

    expect(useLibraryAlbumsMock).toHaveBeenCalledWith(expect.anything(), true);
  });
});
