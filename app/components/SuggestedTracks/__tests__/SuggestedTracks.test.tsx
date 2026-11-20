import { beforeEach, describe, expect, it, vi } from "vitest";

import { act, fireEvent, renderWithProviders, screen } from "@test/test-utils";
import userEvent from "@testing-library/user-event";

const suggestionsMock = vi.fn();
const hideMutate = vi.fn();
const saveYears = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false }));
const saveYearsFor = vi.hoisted(() => vi.fn());
const goneRows = vi.hoisted((): { ids: Set<string>; askedFor: unknown[] } => ({ ids: new Set(), askedFor: [] }));
const addMock = vi.fn();
const reseed = vi.fn();
const playEntity = vi.fn(async () => true);
const togglePlay = vi.fn();
const presence = vi.hoisted(() => ({ of: (_id: string): string => "absent" }));
const scroll = vi.hoisted(() => ({ loadMore: () => {}, hasNextPage: false, isFetchingNextPage: false }));
let pendingId: string | null = null;

vi.mock("@hooks/api/queries/playlist-suggestions/usePlaylistSuggestions", () => ({
  usePlaylistSuggestions: (args: { playlistId: string; seed: number }) => suggestionsMock(args),
}));

vi.mock("@hooks/api/queries/playlist-suggestions/usePlaylistSuggestionSeed", () => ({
  usePlaylistSuggestionSeed: () => ({ seed: 7, reseed }),
}));

vi.mock("@hooks/api/mutations/playlists/useHidePlaylistSuggestion", () => ({
  useHidePlaylistSuggestion: () => ({ mutate: hideMutate }),
}));

vi.mock("@hooks/api/queries/playlist-suggestions/usePlaylistSuggestionGone", () => ({
  usePlaylistSuggestionGone: (key: { playlistId: string; seed: number }) => {
    goneRows.askedFor.push(key);
    return { gone: goneRows.ids };
  },
}));

vi.mock("@hooks/api/mutations/playlists/useSetPlaylistSuggestionYears", () => ({
  useSetPlaylistSuggestionYears: (playlistId: string) => {
    saveYearsFor(playlistId);
    return saveYears;
  },
}));

vi.mock("@hooks/api/mutations/playlists/useAddSuggestedTrack", () => ({
  useAddSuggestedTrack: () => ({ add: addMock, pendingId }),
}));

vi.mock("@hooks/ui/useEntityPlayback", () => ({ useEntityPlayback: () => ({ playEntity }) }));

vi.mock("@hooks/ui/player", () => ({
  useQueuePresence: () => (id: string) => presence.of(id),
  playerActions: { togglePlay: () => togglePlay() },
}));

vi.mock(import("@hooks/ui/trackPreview"), async (importOriginal) => ({
  ...(await importOriginal()),
  useTrackPreview: () => ({ status: "idle", active: false, clock: null, toggle: vi.fn(), seek: vi.fn() }),
}));

vi.mock("@hooks/ui/useInfiniteScroll", () => ({
  useInfiniteScroll: (args: { hasNextPage: boolean; isFetchingNextPage: boolean; onLoadMore: () => void }) => {
    scroll.loadMore = args.onLoadMore;
    scroll.hasNextPage = args.hasNextPage;
    scroll.isFetchingNextPage = args.isFetchingNextPage;
    return () => {};
  },
}));

import { SuggestedTracks } from "../SuggestedTracks";

function suggestion(index: number, overrides?: Record<string, unknown>) {
  return {
    externalId: `ext-${index}`,
    title: `Song ${index}`,
    artist: `Artist ${index}`,
    album: null,
    inLibrary: false,
    requestId: null,
    hasPreview: true,
    ...overrides,
  };
}

const ANY_YEAR = { from: null, to: null };

function loaded(pages: unknown[][], overrides?: Record<string, unknown>, years: Record<string, unknown> = ANY_YEAR) {
  return {
    data: {
      pages: pages.map((tracks, index) => ({ tracks, years, nextCursor: index + 1, widerCursor: 40 })),
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    fetchNextPage: vi.fn(),
    refetch: vi.fn(),
    ...overrides,
  };
}

function titles() {
  return screen.getAllByRole("listitem").map((row) => row.textContent ?? "");
}

beforeEach(() => {
  vi.clearAllMocks();
  pendingId = null;
  goneRows.ids = new Set();
  goneRows.askedFor.length = 0;
  saveYears.isPending = false;
  presence.of = () => "absent";
  addMock.mockResolvedValue(true);
});

describe("SuggestedTracks", () => {
  it("lists every loaded page and asks the server for the next one when the list is scrolled to its end", () => {
    const fetchNextPage = vi.fn();
    suggestionsMock.mockReturnValue(
      loaded(
        [
          [suggestion(1), suggestion(2)],
          [suggestion(2), suggestion(3)],
        ],
        { hasNextPage: true, fetchNextPage }
      )
    );
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    expect(suggestionsMock).toHaveBeenCalledWith({ playlistId: "pl-1", seed: 7 });
    expect(titles()).toHaveLength(3);
    expect(scroll.hasNextPage).toBe(true);

    scroll.loadMore();
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("stops asking and says the list is over once no page is left to read", () => {
    suggestionsMock.mockReturnValue(loaded([[suggestion(1)], [suggestion(1)]], { hasNextPage: false }));
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    expect(titles()).toHaveLength(1);
    expect(scroll.hasNextPage).toBe(false);
    expect(screen.getByText("You have seen everything close to this playlist.")).toBeInTheDocument();
  });

  it("says what the suggestions rest on while no years are set", () => {
    suggestionsMock.mockReturnValue(loaded([[suggestion(1)]]));
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    expect(screen.getByText("Based on the artists in this playlist.")).toBeInTheDocument();
  });

  it("names the years the playlist remembers in place of the basis", () => {
    suggestionsMock.mockReturnValue(loaded([[suggestion(1)]], undefined, { from: 1990, to: 2005 }));
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    expect(screen.getByText("1990 – 2005")).toBeInTheDocument();
    expect(screen.queryByText("Based on the artists in this playlist.")).not.toBeInTheDocument();
  });

  it("keeps naming the remembered years while a refreshed batch is on its way", () => {
    suggestionsMock.mockReturnValue(loaded([[suggestion(1)]], undefined, { from: 1990, to: 2005 }));
    const { rerender } = renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    suggestionsMock.mockReturnValue({ ...loaded([]), data: undefined, isLoading: true, isFetching: true });
    rerender(<SuggestedTracks playlistId="pl-1" />);

    expect(screen.getByText("1990 – 2005")).toBeInTheDocument();
    expect(screen.queryByText("Based on the artists in this playlist.")).not.toBeInTheDocument();
  });

  it("does not carry one playlist's years over to another while that one loads", () => {
    suggestionsMock.mockReturnValue(loaded([[suggestion(1)]], undefined, { from: 1990, to: 2005 }));
    const { rerender } = renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    suggestionsMock.mockReturnValue({ ...loaded([]), data: undefined, isLoading: true, isFetching: true });
    rerender(<SuggestedTracks playlistId="pl-2" />);

    expect(screen.getByText("Based on the artists in this playlist.")).toBeInTheDocument();
  });

  it("saves the applied years through this playlist's save, and names them once they are saved", async () => {
    suggestionsMock.mockReturnValue(loaded([[suggestion(1)]]));
    const { rerender } = renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    await userEvent.click(screen.getByRole("button", { name: "Filter suggestions" }));
    fireEvent.change(screen.getByRole("slider", { name: "Earliest year" }), { target: { value: "1990" } });
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(saveYearsFor).toHaveBeenLastCalledWith("pl-1");
    expect(saveYears.mutate).toHaveBeenCalledTimes(1);
    const [input, options] = saveYears.mutate.mock.calls[0];
    expect(input).toEqual({ playlistId: "pl-1", from: 1990, to: null });
    const scroller = screen.getByRole("list").parentElement;
    if (scroller === null) throw new Error("the list has no scroller");
    scroller.scrollTop = 120;

    suggestionsMock.mockReturnValue({ ...loaded([]), data: undefined, isLoading: true, isFetching: true });
    rerender(<SuggestedTracks playlistId="pl-1" />);
    expect(screen.queryByText("From 1990")).not.toBeInTheDocument();

    act(() => options.onSuccess());
    expect(screen.getByText("From 1990")).toBeInTheDocument();
    expect(scroller.scrollTop).toBe(0);
    expect(reseed).not.toHaveBeenCalled();
  });

  it("leaves out the rows taken out of this playlist's batch and keeps the others", () => {
    goneRows.ids = new Set(["ext-2"]);
    suggestionsMock.mockReturnValue(loaded([[suggestion(1), suggestion(2), suggestion(3)]]));
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByText("Song 2")).not.toBeInTheDocument();
    expect(goneRows.askedFor.at(-1)).toEqual({ playlistId: "pl-1", seed: 7 });
  });

  it("says nothing matches those years when a filtered batch comes back empty", () => {
    suggestionsMock.mockReturnValue(loaded([[]], undefined, { from: 1990, to: 2005 }));
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    expect(screen.getByText("Nothing to suggest from those years.")).toBeInTheDocument();
    expect(screen.queryByText("Nothing left to suggest.")).not.toBeInTheDocument();
  });

  it("keeps the rows and stops loading on its own when a later page fails, until asked to try again", async () => {
    const fetchNextPage = vi.fn();
    suggestionsMock.mockReturnValue(
      loaded([[suggestion(1)]], { hasNextPage: true, isError: true, isFetchNextPageError: true, fetchNextPage })
    );
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    expect(titles()).toHaveLength(1);
    expect(scroll.hasNextPage).toBe(false);
    expect(screen.getByRole("alert")).toHaveTextContent("More suggestions could not be loaded.");

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("offers Request and add for a catalog track and Add for one already in the library", () => {
    suggestionsMock.mockReturnValue(loaded([[suggestion(1), suggestion(2, { inLibrary: true, requestId: "req-2" })]]));
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    expect(screen.getByRole("button", { name: "Request Song 1 and add it to the playlist" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Song 2 to the playlist" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play Song 2" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Play Song 1" })).not.toBeInTheDocument();
  });

  it("records the dismissal of a hidden row for this playlist", async () => {
    suggestionsMock.mockReturnValue(loaded([[suggestion(1), suggestion(2)]]));
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    await userEvent.click(screen.getByRole("button", { name: "Not for this playlist: Song 1" }));

    expect(hideMutate).toHaveBeenCalledWith({ playlistId: "pl-1", externalId: "ext-1" });
  });

  it("hands the row to the add when its button is pressed", async () => {
    suggestionsMock.mockReturnValue(loaded([[suggestion(1), suggestion(2)]]));
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    await userEvent.click(screen.getByRole("button", { name: "Request Song 2 and add it to the playlist" }));

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ externalId: "ext-2" }));
  });

  it("disables the add button of the row that is being added", () => {
    pendingId = "ext-1";
    suggestionsMock.mockReturnValue(loaded([[suggestion(1), suggestion(2)]]));
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    expect(screen.getByRole("button", { name: "Request Song 1 and add it to the playlist" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Request Song 2 and add it to the playlist" })).toBeEnabled();
  });

  it("plays a library suggestion, and toggles the player instead when it is the one playing", async () => {
    suggestionsMock.mockReturnValue(loaded([[suggestion(2, { inLibrary: true, requestId: "req-2" })]]));
    const { rerender } = renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    await userEvent.click(screen.getByRole("button", { name: "Play Song 2" }));
    expect(playEntity).toHaveBeenCalledWith({ kind: "tracks", trackIds: ["req-2"] });
    expect(togglePlay).not.toHaveBeenCalled();

    presence.of = () => "playing";
    rerender(<SuggestedTracks playlistId="pl-1" />);

    await userEvent.click(screen.getByRole("button", { name: "Pause Song 2" }));
    expect(togglePlay).toHaveBeenCalledTimes(1);
    expect(playEntity).toHaveBeenCalledTimes(1);
  });

  it("asks for a new seed on refresh, and not while a batch is on its way", async () => {
    suggestionsMock.mockReturnValue(loaded([[suggestion(1)]]));
    const { rerender } = renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    await userEvent.click(screen.getByRole("button", { name: "Refresh suggestions" }));
    expect(reseed).toHaveBeenCalledTimes(1);

    suggestionsMock.mockReturnValue(loaded([[suggestion(1)]], { isFetching: true }));
    rerender(<SuggestedTracks playlistId="pl-1" />);
    expect(screen.getByRole("button", { name: "Refresh suggestions" })).toBeDisabled();
  });

  it("shows placeholders while the first batch loads and no rows", () => {
    suggestionsMock.mockReturnValue({ ...loaded([]), data: undefined, isLoading: true, isFetching: true });
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(screen.queryByText("Nothing left to suggest.")).not.toBeInTheDocument();
  });

  it("says there is nothing left when the batch is empty", () => {
    suggestionsMock.mockReturnValue(loaded([[]]));
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    expect(screen.getByText("Nothing left to suggest.")).toBeInTheDocument();
  });

  it("reports a failed load and retries on demand instead of showing an empty list", async () => {
    const refetch = vi.fn();
    suggestionsMock.mockReturnValue({ ...loaded([]), data: undefined, isError: true, refetch });
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Suggestions could not be loaded.");
    expect(screen.queryByText("Nothing left to suggest.")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
