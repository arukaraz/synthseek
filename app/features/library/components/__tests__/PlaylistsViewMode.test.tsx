import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ReactNode } from "react";

import { renderWithProviders, screen } from "@test/test-utils";
import type { LibraryPlaylistItem } from "@hooks/api/queries/library/types";
import type { LibraryViewModeProps } from "../../types";

import { PlaylistsViewMode } from "../PlaylistsViewMode";

const openForTargetMock = vi.hoisted(() => vi.fn());
const playlistLibraryTargetMock = vi.hoisted(() => vi.fn((input: unknown) => ({ type: "playlist", input })));
const useLibraryPlaylistsMock = vi.hoisted(() => vi.fn());

vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ openForTarget: openForTargetMock }),
}));

vi.mock("@features/content-detail", () => ({
  playlistLibraryTarget: playlistLibraryTargetMock,
}));

vi.mock("@hooks/api", () => ({
  useLibraryPlaylists: useLibraryPlaylistsMock,
}));

vi.mock("../LibraryViewLayout/LibraryViewLayout", () => ({
  LibraryViewLayout: ({
    items,
    content,
  }: {
    items: LibraryPlaylistItem[] | undefined;
    content: { renderCard: (item: LibraryPlaylistItem) => ReactNode };
  }) => <div>{(items ?? []).map((item) => content.renderCard(item))}</div>,
}));

function createPlaylist(overrides?: Partial<LibraryPlaylistItem>): LibraryPlaylistItem {
  return {
    id: "pl-1",
    external_id: "ext-1",
    name: "Road Trip",
    owner: "nexus",
    image: "https://example.com/cover.jpg",
    images: ["https://example.com/alt.jpg"],
    status: "complete",
    total_tracks: 20,
    completed_tracks: 18,
    source_provider: null,
    sync_enabled: false,
    created_at: new Date("2024-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function makeProps(): LibraryViewModeProps {
  return {
    controller: {
      view: "playlists",
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

describe("PlaylistsViewMode", () => {
  beforeEach(() => {
    openForTargetMock.mockReset();
    playlistLibraryTargetMock.mockClear();
    useLibraryPlaylistsMock.mockReturnValue({
      items: [createPlaylist()],
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

  it("opens the playlist target preferring the primary image", async () => {
    const { user } = renderWithProviders(<PlaylistsViewMode {...makeProps()} />);

    await user.click(screen.getByRole("button", { name: /Open details for Road Trip/i }));

    expect(playlistLibraryTargetMock).toHaveBeenCalledWith({
      id: "pl-1",
      name: "Road Trip",
      cover: "https://example.com/cover.jpg",
    });
    expect(openForTargetMock).toHaveBeenCalledTimes(1);
  });

  it("falls back to the first image when no primary image is set", async () => {
    useLibraryPlaylistsMock.mockReturnValue({
      items: [createPlaylist({ image: null })],
      total: 1,
      facets: {},
      isLoading: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    const { user } = renderWithProviders(<PlaylistsViewMode {...makeProps()} />);

    await user.click(screen.getByRole("button", { name: /Open details for Road Trip/i }));

    expect(playlistLibraryTargetMock).toHaveBeenCalledWith({
      id: "pl-1",
      name: "Road Trip",
      cover: "https://example.com/alt.jpg",
    });
  });

  it("gates the playlists query on the active view being playlists", () => {
    renderWithProviders(<PlaylistsViewMode {...makeProps()} />);

    expect(useLibraryPlaylistsMock).toHaveBeenCalledWith(expect.anything(), true);
  });
});
