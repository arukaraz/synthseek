import { afterEach, describe, expect, it, vi } from "vitest";

import enDiscover from "@modules/i18n/messages/en/discover.json";
import { fireEvent, renderWithProviders, screen } from "@test/test-utils";

import { ArtistSpotlight } from "../ArtistSpotlight";
import type { ArtistSpotlightCardProps } from "../types";

interface SpotlightArtist {
  artist: ArtistSpotlightCardProps["artist"];
  latestAlbum: ArtistSpotlightCardProps["latestAlbum"];
  inLibrary: boolean;
}

interface SpotlightQuery {
  data: SpotlightArtist[] | undefined;
  isLoading: boolean;
  isError: boolean;
  pending: readonly string[];
  replace: (artistId: string) => Promise<void>;
  reroll: () => Promise<void>;
}

const replace = vi.fn(async (_artistId: string) => {});
const reroll = vi.fn(async () => {});

const useArtistsForYouMock = vi.fn<() => SpotlightQuery>();
const openForResult = vi.fn();
const shuffleEntity = vi.fn();

vi.mock("@hooks/api/queries/analytics/useArtistsForYou", () => ({
  useArtistsForYou: () => useArtistsForYouMock(),
}));

vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ openForResult, openForTarget: vi.fn() }),
}));

vi.mock("@hooks/ui/useEntityPlayback", () => ({
  useEntityPlayback: () => ({ shuffleEntity }),
}));

vi.mock("../ArtistSpotlightCard", () => ({
  ArtistSpotlightCard: ({ artist, onClick, onPlay, onDismiss, loading }: ArtistSpotlightCardProps) => (
    <>
      <button
        type="button"
        data-testid="artist-card"
        data-id={artist.id}
        data-loading={loading ? "true" : "false"}
        onClick={onClick}
      >
        {artist.name}
      </button>
      {onDismiss ? (
        <button type="button" onClick={onDismiss}>
          dismiss {artist.name}
        </button>
      ) : null}
      {onPlay ? (
        <button type="button" onClick={onPlay}>
          play {artist.name}
        </button>
      ) : null}
    </>
  ),
}));

function buildArtist(id: string, name: string): SpotlightArtist {
  return {
    artist: { id, name, images: [] },
    latestAlbum: null,
    inLibrary: false,
  };
}

function buildQuery(overrides: Partial<SpotlightQuery> = {}): SpotlightQuery {
  return {
    data: [buildArtist("artist-1", "Aphex Twin")],
    isLoading: false,
    isError: false,
    pending: [],
    replace,
    reroll,
    ...overrides,
  };
}

describe("ArtistSpotlight", () => {
  afterEach(() => {
    vi.clearAllMocks();
    useArtistsForYouMock.mockReset();
  });

  it("always renders the widget header", () => {
    useArtistsForYouMock.mockReturnValue(buildQuery());

    renderWithProviders(<ArtistSpotlight size="L" info="Artists to explore next" />);

    expect(screen.getByRole("heading", { name: enDiscover.artistSpotlight.title })).toBeInTheDocument();
    expect(useArtistsForYouMock).toHaveBeenCalledWith();
  });

  it("renders the loading skeleton while the query is pending", () => {
    useArtistsForYouMock.mockReturnValue(buildQuery({ isLoading: true, data: undefined }));

    const { container } = renderWithProviders(<ArtistSpotlight size="L" info="Artists to explore next" />);

    expect(container.querySelector(".animate-pulse")).not.toBeNull();
    expect(screen.queryByTestId("artist-card")).not.toBeInTheDocument();
  });

  it("renders the error empty state when the query errors", () => {
    useArtistsForYouMock.mockReturnValue(buildQuery({ isError: true, data: undefined }));

    renderWithProviders(<ArtistSpotlight size="L" info="Artists to explore next" />);

    expect(screen.getByText(enDiscover.artistSpotlight.errorTitle)).toBeInTheDocument();
    expect(screen.getByText(enDiscover.artistSpotlight.errorDescription)).toBeInTheDocument();
  });

  it("renders the empty state when the resolved artist list is empty", () => {
    useArtistsForYouMock.mockReturnValue(buildQuery({ data: [] }));

    renderWithProviders(<ArtistSpotlight size="L" info="Artists to explore next" />);

    expect(screen.getByText(enDiscover.artistSpotlight.emptyTitle)).toBeInTheDocument();
    expect(screen.getByText(enDiscover.artistSpotlight.emptyDescription)).toBeInTheDocument();
  });

  it("renders the empty state when the query data is absent and not loading or erroring", () => {
    useArtistsForYouMock.mockReturnValue(buildQuery({ data: undefined }));

    renderWithProviders(<ArtistSpotlight size="L" info="Artists to explore next" />);

    expect(screen.getByText(enDiscover.artistSpotlight.emptyTitle)).toBeInTheDocument();
  });

  it("shuffles an artist the library holds and offers nothing to play otherwise", () => {
    useArtistsForYouMock.mockReturnValue(
      buildQuery({ data: [{ ...buildArtist("a", "Autechre"), inLibrary: true }, buildArtist("b", "Bonobo")] })
    );

    renderWithProviders(<ArtistSpotlight size="L" info="Artists to explore next" />);

    fireEvent.click(screen.getByRole("button", { name: "play Autechre" }));
    expect(shuffleEntity).toHaveBeenCalledWith({ kind: "artist", artist: "Autechre" });
    expect(screen.queryByRole("button", { name: "play Bonobo" })).not.toBeInTheDocument();
  });

  it("renders a card per artist when the list resolves", () => {
    useArtistsForYouMock.mockReturnValue(
      buildQuery({ data: [buildArtist("a", "Boards of Canada"), buildArtist("b", "Autechre")] })
    );

    renderWithProviders(<ArtistSpotlight size="L" info="Artists to explore next" />);

    const cards = screen.getAllByTestId("artist-card");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveAttribute("data-id", "a");
  });

  it("lays the cards on a rail at half width and on a grid in a wide tile", () => {
    useArtistsForYouMock.mockReturnValue(
      buildQuery({ data: [buildArtist("a", "Boards of Canada"), buildArtist("b", "Autechre")] })
    );

    const { unmount } = renderWithProviders(<ArtistSpotlight size="M" info="Artists to explore next" />);
    expect(screen.getByRole("region", { name: "All suggested artists, scroll sideways" })).toHaveAttribute(
      "tabindex",
      "0"
    );
    expect(screen.getAllByTestId("artist-card")).toHaveLength(2);
    unmount();

    renderWithProviders(<ArtistSpotlight size="XL" info="Artists to explore next" />);
    expect(screen.queryByRole("region", { name: "All suggested artists, scroll sideways" })).not.toBeInTheDocument();
    expect(screen.getAllByTestId("artist-card")).toHaveLength(2);
  });

  it("lists the artists as rows with their latest release in a quarter tile, without the photo cards", () => {
    useArtistsForYouMock.mockReturnValue(
      buildQuery({
        data: [
          {
            ...buildArtist("a", "Boards of Canada"),
            latestAlbum: { id: "al", name: "Tomorrow's Harvest", images: [] },
          },
          buildArtist("b", "Autechre"),
        ],
      })
    );

    renderWithProviders(<ArtistSpotlight size="S" info="Artists to explore next" />);

    expect(screen.queryByTestId("artist-card")).not.toBeInTheDocument();
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Tomorrow's Harvest");
    expect(rows[1]).toHaveTextContent(enDiscover.artistSpotlight.noAlbums);

    fireEvent.click(screen.getByRole("button", { name: /Autechre/ }));
    expect(openForResult.mock.calls[0][0]).toMatchObject({ id: "b", name: "Autechre" });
  });

  it("swaps one artist from its card and every artist from the header", () => {
    useArtistsForYouMock.mockReturnValue(
      buildQuery({ data: [buildArtist("a", "Boards of Canada"), buildArtist("b", "Autechre")] })
    );

    renderWithProviders(<ArtistSpotlight size="L" info="Artists to explore next" />);

    fireEvent.click(screen.getByRole("button", { name: "dismiss Autechre" }));
    expect(replace).toHaveBeenCalledWith("b");
    fireEvent.click(screen.getByRole("button", { name: enDiscover.artistSpotlight.reroll }));
    expect(reroll).toHaveBeenCalledOnce();
  });

  it("holds both swaps while one is loading and shows which card is loading", () => {
    useArtistsForYouMock.mockReturnValue(
      buildQuery({ data: [buildArtist("a", "Boards of Canada"), buildArtist("b", "Autechre")], pending: ["b"] })
    );

    renderWithProviders(<ArtistSpotlight size="L" info="Artists to explore next" />);

    const reroll = screen.getByRole("button", { name: enDiscover.artistSpotlight.reroll });
    expect(reroll).toBeDisabled();
    expect(reroll).toHaveAttribute("aria-busy", "false");
    expect(screen.getAllByTestId("artist-card").map((card) => card.dataset.loading)).toEqual(["false", "true"]);
  });

  it("marks the reroll busy while every artist is being replaced", () => {
    useArtistsForYouMock.mockReturnValue(
      buildQuery({ data: [buildArtist("a", "Boards of Canada"), buildArtist("b", "Autechre")], pending: ["a", "b"] })
    );

    renderWithProviders(<ArtistSpotlight size="L" info="Artists to explore next" />);

    expect(screen.getByRole("button", { name: enDiscover.artistSpotlight.reroll })).toHaveAttribute(
      "aria-busy",
      "true"
    );
    expect(screen.getAllByTestId("artist-card").map((card) => card.dataset.loading)).toEqual(["true", "true"]);
  });

  it("opens the request flow for the clicked artist", () => {
    useArtistsForYouMock.mockReturnValue(buildQuery({ data: [buildArtist("a", "Squarepusher")] }));

    renderWithProviders(<ArtistSpotlight size="L" info="Artists to explore next" />);
    fireEvent.click(screen.getByTestId("artist-card"));

    expect(openForResult).toHaveBeenCalledTimes(1);
    expect(openForResult.mock.calls[0][0]).toMatchObject({ id: "a", name: "Squarepusher" });
  });
});
