import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ReactNode } from "react";

import { renderWithProviders, screen, waitFor } from "@test/test-utils";
import type { LibraryArtistItem } from "@hooks/api/queries/library/types";
import type { LibraryViewModeProps } from "../../types";

import { ArtistsViewMode } from "../ArtistsViewMode";

const fetchMock = vi.hoisted(() => vi.fn());
const openForResultMock = vi.hoisted(() => vi.fn());
const toastErrorMock = vi.hoisted(() => vi.fn());
const artistRequestItemMock = vi.hoisted(() =>
  vi.fn((input: { id: string; name: string }) => ({ type: "artist", ...input }))
);

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({ contentDetail: { resolveArtist: { fetch: fetchMock } } }),
    contentDetail: { resolveArtist: { useQuery: () => ({ data: null, isLoading: false }) } },
  },
}));

vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ openForResult: openForResultMock }),
}));

vi.mock("@features/content-detail", () => ({
  artistRequestItem: artistRequestItemMock,
}));

vi.mock("sonner", () => ({ toast: { error: toastErrorMock } }));

vi.mock("@hooks/api", () => ({
  useLibraryArtists: () => ({
    items: [{ artist: "Daft Punk", trackCount: 42, albumCount: 6, albumArt: null, genre: "electronic" }],
    total: 1,
    facets: {},
    isLoading: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
  }),
}));

vi.mock("../LibraryViewLayout/LibraryViewLayout", () => ({
  LibraryViewLayout: ({
    items,
    content,
  }: {
    items: LibraryArtistItem[] | undefined;
    content: { renderCard: (item: LibraryArtistItem) => ReactNode };
  }) => <div>{(items ?? []).map((item) => content.renderCard(item))}</div>,
}));

function makeProps(): LibraryViewModeProps {
  const controller = {
    view: "artists",
    search: "",
    sort: "name",
    direction: undefined,
    filters: {},
    facetSearch: {},
  };
  return {
    controller: controller as unknown as LibraryViewModeProps["controller"],
    filtersOpen: false,
    onFiltersOpenChange: vi.fn(),
  };
}

describe("ArtistsViewMode", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    openForResultMock.mockReset();
    toastErrorMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("resolves the artist name and opens the detail flow on click", async () => {
    fetchMock.mockResolvedValue({ deezerArtistId: "dz-1", name: "Daft Punk", image: null });
    const { user } = renderWithProviders(<ArtistsViewMode {...makeProps()} />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => expect(openForResultMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith({ name: "Daft Punk" });
    expect(artistRequestItemMock).toHaveBeenCalledWith({ id: "dz-1", name: "Daft Punk" });
    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  it("toasts and does not open the flow when the artist cannot be resolved", async () => {
    fetchMock.mockResolvedValue(null);
    const { user } = renderWithProviders(<ArtistsViewMode {...makeProps()} />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => expect(toastErrorMock).toHaveBeenCalledTimes(1));
    expect(openForResultMock).not.toHaveBeenCalled();
  });

  it("does not fire a second resolve while one is already in flight", async () => {
    let resolveFetch: (value: { deezerArtistId: string; name: string; image: null } | null) => void = () => {};
    fetchMock.mockReturnValue(new Promise((resolve) => (resolveFetch = resolve)));
    const { user } = renderWithProviders(<ArtistsViewMode {...makeProps()} />);

    const card = screen.getByRole("button");
    await user.click(card);
    await user.click(card);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch({ deezerArtistId: "dz-1", name: "Daft Punk", image: null });
    await waitFor(() => expect(openForResultMock).toHaveBeenCalledTimes(1));
  });
});
