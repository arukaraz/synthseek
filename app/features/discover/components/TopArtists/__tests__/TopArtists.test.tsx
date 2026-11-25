import { afterEach, describe, expect, it, vi } from "vitest";

import { fireEvent, renderWithProviders, screen, within } from "@test/test-utils";

import { TopArtists } from "../TopArtists";

interface Artist {
  name: string;
  playcount: number;
  catalogArtistId: string | null;
  image: string | null;
}

const mocks = vi.hoisted(() => ({
  topArtists: vi.fn(),
  openForTarget: vi.fn(),
}));

vi.mock("@hooks/api/queries/analytics/useProviderTopArtists", () => ({
  useProviderTopArtists: (provider: string) => mocks.topArtists(provider),
}));
vi.mock("@hooks/ui/useEntityPlayback", () => ({
  useEntityPlayback: () => ({ playEntity: vi.fn(), shuffleEntity: vi.fn(), startRadio: vi.fn() }),
}));
vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ openForTarget: mocks.openForTarget, requestResult: vi.fn() }),
}));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src }: { src: string }) => <img src={src} alt="" />,
}));

function ready<T>(data: T) {
  return { data, isLoading: false, isError: false };
}

function artist(name: string, overrides: Partial<Artist> = {}): Artist {
  return { name, playcount: 1200, catalogArtistId: `id-${name}`, image: null, ...overrides };
}

function readyWith(artists: Artist[]) {
  return ready({ status: "ready", username: "listener", artists });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("TopArtists", () => {
  it("leads with the most played artist under its badge, with no rank number, and ranks the rest from two", () => {
    mocks.topArtists.mockReturnValue(readyWith([artist("Tycho"), artist("Bonobo", { playcount: 1 })]));
    renderWithProviders(<TopArtists size="M" info="x" />);

    expect(mocks.topArtists).toHaveBeenCalledWith("lastfm");
    expect(screen.getByRole("heading", { name: "Top Artists" })).toBeInTheDocument();
    expect(screen.getByText("Most played · all time · Last.fm")).toBeInTheDocument();
    const leader = screen.getByRole("article");
    expect(leader).toHaveTextContent("#1 most played");
    expect(leader).toHaveTextContent("Tycho");
    expect(leader).toHaveTextContent("1,200 plays");
    expect(within(leader).queryByText("1")).not.toBeInTheDocument();
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("2");
    expect(rows[0]).toHaveTextContent("1 play");
    expect(rows[0]).not.toHaveTextContent("1 plays");
  });

  it("reads ListenBrainz and names it when the tile is the ListenBrainz one", () => {
    mocks.topArtists.mockReturnValue(readyWith([artist("Tycho")]));
    renderWithProviders(<TopArtists size="M" info="x" provider="listenbrainz" />);

    expect(mocks.topArtists).toHaveBeenCalledWith("listenbrainz");
    expect(screen.getByText("Most played · all time · ListenBrainz")).toBeInTheDocument();
  });

  it("opens the artist the catalog matched, and offers nothing to open for one it did not", () => {
    mocks.topArtists.mockReturnValue(
      readyWith([artist("Tycho", { image: "tycho.jpg" }), artist("Unknown", { catalogArtistId: null })])
    );
    renderWithProviders(<TopArtists size="M" info="x" />);

    fireEvent.click(screen.getByRole("button", { name: /Tycho/ }));

    expect(mocks.openForTarget).toHaveBeenCalledTimes(1);
    expect(mocks.openForTarget).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "artist", id: "id-Tycho", name: "Tycho", cover: "tycho.jpg" })
    );
    expect(screen.queryByRole("button", { name: /Unknown/ })).not.toBeInTheDocument();
  });

  it("shows only the leader in a quarter tile, as the Leader look does", () => {
    mocks.topArtists.mockReturnValue(readyWith(["a", "b", "c", "d", "e", "f"].map((name) => artist(name))));
    renderWithProviders(<TopArtists size="S" info="x" />);

    expect(screen.getByRole("article")).toHaveTextContent("a");
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("says the provider is not set up on this server, with no link to the member's settings", () => {
    mocks.topArtists.mockReturnValue(ready({ status: "inactive" }));
    renderWithProviders(<TopArtists size="M" info="x" />);

    expect(screen.getByText("Last.fm is not set up on this server.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Settings/ })).not.toBeInTheDocument();
  });

  it("asks for the username and points to that provider's settings when the member is not linked", () => {
    mocks.topArtists.mockReturnValue(ready({ status: "unlinked" }));
    renderWithProviders(<TopArtists size="M" info="x" provider="listenbrainz" />);

    expect(screen.getByText("Add your ListenBrainz username to see these.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Settings/ })).toHaveAttribute(
      "href",
      "/settings/connections/services#listenbrainz.feeds"
    );
  });

  it("says when there is nothing ranked yet, and when it could not load", () => {
    mocks.topArtists.mockReturnValue(readyWith([]));
    const { unmount } = renderWithProviders(<TopArtists size="M" info="x" />);
    expect(screen.getByText("No top artists yet, play some music to see them ranked.")).toBeInTheDocument();
    unmount();

    mocks.topArtists.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderWithProviders(<TopArtists size="M" info="x" />);
    expect(screen.getByText("Couldn't load this right now.")).toBeInTheDocument();
  });
});
