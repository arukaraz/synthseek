import { beforeEach, describe, expect, it, vi } from "vitest";

import { act, renderWithProviders, screen, waitFor } from "@test/test-utils";
import userEvent from "@testing-library/user-event";

const suggestionsMock = vi.fn();
const hideMutate = vi.fn();
const addMock = vi.fn();
const playEntity = vi.fn(async () => true);
const togglePlay = vi.fn();
const presence = vi.hoisted(() => ({ of: (_id: string): string => "absent" }));
const scroll = vi.hoisted(() => ({ loadMore: () => {}, hasNextPage: false }));
let pendingId: string | null = null;

vi.mock("@hooks/api/queries/usePlaylistSuggestions", () => ({
  usePlaylistSuggestions: (args: { playlistId: string; seed: number }) => suggestionsMock(args),
}));

vi.mock("@hooks/api/mutations/playlists/useHidePlaylistSuggestion", () => ({
  useHidePlaylistSuggestion: () => ({ mutate: hideMutate }),
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
  useInfiniteScroll: (args: { hasNextPage: boolean; onLoadMore: () => void }) => {
    scroll.loadMore = args.onLoadMore;
    scroll.hasNextPage = args.hasNextPage;
    return { current: null };
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

function loaded(tracks: unknown[]) {
  return {
    data: { tracks },
    isLoading: false,
    isFetching: false,
    isError: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
  };
}

function titles() {
  return screen.getAllByRole("listitem").map((row) => row.textContent ?? "");
}

beforeEach(() => {
  vi.clearAllMocks();
  pendingId = null;
  presence.of = () => "absent";
  addMock.mockResolvedValue(true);
});

describe("SuggestedTracks", () => {
  it("shows the first eight suggestions and reveals eight more when the list is scrolled to its end", () => {
    suggestionsMock.mockReturnValue(loaded(Array.from({ length: 20 }, (_, index) => suggestion(index))));
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    expect(screen.getAllByRole("listitem")).toHaveLength(8);
    expect(scroll.hasNextPage).toBe(true);

    act(() => scroll.loadMore());
    expect(screen.getAllByRole("listitem")).toHaveLength(16);

    act(() => scroll.loadMore());
    expect(screen.getAllByRole("listitem")).toHaveLength(20);
    expect(screen.getByText("That is everything for now. Refresh for a new batch.")).toBeInTheDocument();
  });

  it("offers Request and add for a catalog track and Add for one already in the library", () => {
    suggestionsMock.mockReturnValue(loaded([suggestion(1), suggestion(2, { inLibrary: true, requestId: "req-2" })]));
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    expect(screen.getByRole("button", { name: "Request Song 1 and add it to the playlist" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Song 2 to the playlist" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play Song 2" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Play Song 1" })).not.toBeInTheDocument();
  });

  it("removes a hidden row at once and records the dismissal for this playlist", async () => {
    suggestionsMock.mockReturnValue(loaded([suggestion(1), suggestion(2)]));
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    await userEvent.click(screen.getByRole("button", { name: "Not for this playlist: Song 1" }));

    expect(hideMutate).toHaveBeenCalledWith({ playlistId: "pl-1", externalId: "ext-1" });
    expect(titles()).toHaveLength(1);
    expect(titles()[0]).toContain("Song 2");
  });

  it("drops a row once it was added and keeps it when the add failed", async () => {
    suggestionsMock.mockReturnValue(loaded([suggestion(1), suggestion(2)]));
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    addMock.mockResolvedValueOnce(false);
    await userEvent.click(screen.getByRole("button", { name: "Request Song 1 and add it to the playlist" }));
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ externalId: "ext-1" }));
    expect(titles()).toHaveLength(2);

    await userEvent.click(screen.getByRole("button", { name: "Request Song 2 and add it to the playlist" }));
    await waitFor(() => expect(titles()).toHaveLength(1));
    expect(titles()[0]).toContain("Song 1");
  });

  it("disables the add button of the row that is being added", () => {
    pendingId = "ext-1";
    suggestionsMock.mockReturnValue(loaded([suggestion(1), suggestion(2)]));
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    expect(screen.getByRole("button", { name: "Request Song 1 and add it to the playlist" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Request Song 2 and add it to the playlist" })).toBeEnabled();
  });

  it("plays a library suggestion, and toggles the player instead when it is the one playing", async () => {
    suggestionsMock.mockReturnValue(loaded([suggestion(2, { inLibrary: true, requestId: "req-2" })]));
    const { rerender } = renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    await userEvent.click(screen.getByRole("button", { name: "Play Song 2" }));
    expect(playEntity).toHaveBeenCalledWith({ kind: "tracks", trackIds: ["req-2"] });
    expect(togglePlay).not.toHaveBeenCalled();

    presence.of = () => "playing";
    suggestionsMock.mockReturnValue(loaded([suggestion(2, { inLibrary: true, requestId: "req-2" })]));
    rerender(<SuggestedTracks playlistId="pl-1" />);

    await userEvent.click(screen.getByRole("button", { name: "Pause Song 2" }));
    expect(togglePlay).toHaveBeenCalledTimes(1);
    expect(playEntity).toHaveBeenCalledTimes(1);
  });

  it("asks for a new batch with a new seed on refresh and goes back to the first page", async () => {
    suggestionsMock.mockReturnValue(loaded(Array.from({ length: 20 }, (_, index) => suggestion(index))));
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);
    const firstSeed = suggestionsMock.mock.calls[0][0].seed;
    act(() => scroll.loadMore());
    expect(screen.getAllByRole("listitem")).toHaveLength(16);

    await userEvent.click(screen.getByRole("button", { name: "Refresh suggestions" }));

    const lastSeed = suggestionsMock.mock.lastCall?.[0].seed;
    expect(lastSeed).not.toBe(firstSeed);
    expect(screen.getAllByRole("listitem")).toHaveLength(8);
  });

  it("shows placeholders while the first batch loads and no rows", () => {
    suggestionsMock.mockReturnValue({ ...loaded([]), data: undefined, isLoading: true, isFetching: true });
    renderWithProviders(<SuggestedTracks playlistId="pl-1" />);

    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(screen.queryByText("Nothing left to suggest.")).not.toBeInTheDocument();
  });

  it("says there is nothing left when the batch is empty", () => {
    suggestionsMock.mockReturnValue(loaded([]));
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
