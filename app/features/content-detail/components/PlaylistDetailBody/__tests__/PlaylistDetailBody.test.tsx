import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";
import type { DetailTarget } from "../../../types";

const usePlaylistDetailMock = vi.fn();
const removeMutate = vi.fn();
const setSyncMutate = vi.fn();
const renameMutate = vi.fn();
const deleteMutate = vi.fn();
const syncToPlexMutate = vi.fn();
let setSyncPending = false;

vi.mock("@hooks/api", () => ({
  useRetryTracks: () => ({ mutate: vi.fn(), isPending: false, variables: undefined }),
}));

vi.mock("@hooks/api/queries/content-detail", () => ({
  usePlaylistDetail: (args: { playlistId: string; enabled?: boolean }) => usePlaylistDetailMock(args),
  useCatalogPlaylistTracks: () => ({ data: undefined, isLoading: false }),
}));

vi.mock("@hooks/api/mutations/playlists/useRemoveTracksFromPlaylist", () => ({
  useRemoveTracksFromPlaylist: () => ({ mutate: removeMutate, isPending: false }),
}));

vi.mock("@hooks/api/mutations/playlists/useSetPlaylistSync", () => ({
  useSetPlaylistSync: () => ({ mutate: setSyncMutate, isPending: setSyncPending }),
}));

vi.mock("@hooks/api/mutations/playlists/useRenamePlaylist", () => ({
  useRenamePlaylist: () => ({ mutate: renameMutate, isPending: false }),
}));

vi.mock("@hooks/api/mutations/playlists/useDeletePlaylist", () => ({
  useDeletePlaylist: () => ({ mutate: deleteMutate, isPending: false }),
}));

vi.mock("@hooks/api/mutations/requests/useRetryPlexPlaylist", () => ({
  useRetryPlexPlaylist: () => ({ mutate: syncToPlexMutate, isPending: false }),
}));

vi.mock("../../../ContentDetailActionsContext", () => ({
  useContentDetailActions: () => ({ requestPlaylist: vi.fn(), requestTrack: vi.fn() }),
}));

import { PlaylistDetailBody } from "../PlaylistDetailBody";

function libraryTarget(): DetailTarget {
  return {
    mode: "playlist",
    id: "pl-1",
    name: "Road Trip",
    artistName: "Road Trip",
    cover: null,
    playlistSource: "library",
  };
}

function catalogTarget(): DetailTarget {
  return {
    mode: "playlist",
    id: "pl-cat",
    name: "Top Hits",
    artistName: "Top Hits",
    cover: null,
    playlistSource: "catalog",
  };
}

function playlistDetail(overrides?: Partial<Record<string, unknown>>) {
  return {
    data: {
      id: "pl-1",
      name: "Road Trip",
      cover: null,
      sourceProvider: null,
      syncEnabled: false,
      totalTracks: 2,
      libraryTrackCount: 1,
      requestedTrackCount: 2,
      failedTrackCount: 0,
      tracks: [
        {
          externalId: "t1",
          title: "First",
          artist: "A",
          durationMs: 1000,
          trackNumber: 1,
          isrc: null,
          plays: null,
          inLibrary: true,
          requestId: "r1",
          slskd_request_id: null,
          status: "complete",
          failureReason: null,
        },
        {
          externalId: "t2",
          title: "Second",
          artist: "B",
          durationMs: 1000,
          trackNumber: 2,
          isrc: null,
          plays: null,
          inLibrary: false,
          requestId: "r2",
          slskd_request_id: null,
          status: "downloading",
          failureReason: null,
        },
      ],
      ...overrides,
    },
  };
}

describe("PlaylistDetailBody editing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setSyncPending = false;
  });

  it("renames in place from the kebab and submits the new name via the mutation", async () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail());
    const onClose = vi.fn();
    const { user } = renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={onClose} />);

    expect(screen.queryByLabelText("Playlist name")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Playlist actions for Road Trip" }));
    await user.click(screen.getByRole("menuitem", { name: "Rename" }));

    const input = screen.getByLabelText("Playlist name");
    await user.clear(input);
    await user.type(input, "Summer Mix");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(renameMutate).toHaveBeenCalledWith({ playlistId: "pl-1", name: "Summer Mix" });
  });

  it("does not render a rename dialog in the detail modal", async () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail());
    const { user } = renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Playlist actions for Road Trip" }));
    await user.click(screen.getByRole("menuitem", { name: "Rename" }));

    expect(screen.queryByText("Rename playlist")).not.toBeInTheDocument();
  });

  it("opens the delete confirm dialog from the kebab", async () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail());
    const { user } = renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Playlist actions for Road Trip" }));
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));

    expect(screen.getByText("Delete playlist?")).toBeInTheDocument();
  });

  it("only marks complete/failed rows selectable for removal", () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail());
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} />);

    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("hides the rename menu item when imported and syncing", async () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail({ sourceProvider: "spotify", syncEnabled: true }));
    const { user } = renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Playlist actions for Road Trip" }));

    expect(screen.queryByRole("menuitem", { name: "Rename" })).not.toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Delete" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("re-enables the rename menu item when an imported playlist has sync off", async () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail({ sourceProvider: "spotify", syncEnabled: false }));
    const { user } = renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} />);

    expect(screen.getByRole("switch")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Playlist actions for Road Trip" }));

    expect(screen.getByRole("menuitem", { name: "Rename" })).toBeInTheDocument();
  });

  it("shows the Local origin subtitle for a locally created library playlist", () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail());
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} />);

    expect(screen.getByText("Local")).toBeInTheDocument();
    expect(screen.queryByText("2 tracks")).not.toBeInTheDocument();
  });

  it("shows the capitalized imported-provider origin subtitle for an imported library playlist", () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail({ sourceProvider: "spotify" }));
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} />);

    expect(screen.getByText("Imported: Spotify")).toBeInTheDocument();
  });

  it("keeps the track-count subtitle for a catalog playlist", () => {
    usePlaylistDetailMock.mockReturnValue({ data: undefined });
    renderWithProviders(<PlaylistDetailBody target={catalogTarget()} onClose={vi.fn()} />);

    expect(screen.getByText("0 tracks")).toBeInTheDocument();
    expect(screen.queryByText("Local")).not.toBeInTheDocument();
  });

  it("renders the keep-in-sync control as a sync icon plus a switch for an imported playlist", () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail({ sourceProvider: "spotify", syncEnabled: false }));
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} />);

    const toggle = screen.getByRole("switch", { name: "Keep in sync" });
    expect(toggle).toBeInTheDocument();
    expect(toggle.tagName).toBe("BUTTON");
    expect(screen.queryByText("Keep in sync")).not.toBeInTheDocument();
  });

  it("does not render the keep-in-sync switch for a local library playlist", () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail());
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} />);

    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("toggles sync via the keep-in-sync switch on an imported playlist", async () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail({ sourceProvider: "spotify", syncEnabled: false }));
    const { user } = renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} />);

    await user.click(screen.getByRole("switch"));

    expect(setSyncMutate).toHaveBeenCalledWith({ playlistId: "pl-1", enabled: true });
  });

  it("disables the keep-in-sync switch while the sync mutation is pending", () => {
    setSyncPending = true;
    usePlaylistDetailMock.mockReturnValue(playlistDetail({ sourceProvider: "spotify", syncEnabled: false }));
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} />);

    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("clears the track selection when the keep-in-sync switch flips", async () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail({ sourceProvider: "spotify", syncEnabled: false }));
    const { user } = renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} />);

    await user.click(screen.getByLabelText("Select all"));
    expect(screen.getByText("selected")).toBeInTheDocument();

    await user.click(screen.getByRole("switch"));

    expect(screen.queryByText("selected")).not.toBeInTheDocument();
  });

  it("shows the already-in-library pill by default but hides it when showInLibraryPill is false", () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail());
    const { rerender } = renderWithProviders(
      <PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} showInLibraryPill />
    );
    expect(screen.getByText("Already in library")).toBeInTheDocument();

    rerender(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} showInLibraryPill={false} />);
    expect(screen.queryByText("Already in library")).not.toBeInTheDocument();
  });

  it("confirms before removing the selected tracks in bulk", async () => {
    usePlaylistDetailMock.mockReturnValue(
      playlistDetail({
        tracks: [
          {
            externalId: "t1",
            title: "First",
            artist: "A",
            durationMs: 1000,
            trackNumber: 1,
            isrc: null,
            plays: null,
            inLibrary: true,
            requestId: "r1",
            slskd_request_id: null,
            status: "complete",
            failureReason: null,
          },
          {
            externalId: "t2",
            title: "Second",
            artist: "B",
            durationMs: 1000,
            trackNumber: 2,
            isrc: null,
            plays: null,
            inLibrary: true,
            requestId: "r2",
            slskd_request_id: null,
            status: "failed",
            failureReason: null,
          },
        ],
      })
    );
    const { user } = renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} />);

    await user.click(screen.getByLabelText("Select all"));
    await user.click(screen.getByRole("button", { name: "Remove 2" }));

    expect(removeMutate).not.toHaveBeenCalled();
    expect(screen.getByText("Remove 2 tracks?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(removeMutate).toHaveBeenCalledWith(
      { playlistId: "pl-1", trackIds: ["r1", "r2"] },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it("sorts the tracklist by name and flips direction", async () => {
    usePlaylistDetailMock.mockReturnValue(
      playlistDetail({
        tracks: [
          {
            externalId: "t1",
            title: "Banana",
            artist: "A",
            durationMs: 3000,
            trackNumber: 1,
            isrc: null,
            plays: null,
            inLibrary: true,
            requestId: "r1",
            slskd_request_id: null,
            status: "complete",
            failureReason: null,
          },
          {
            externalId: "t2",
            title: "Apple",
            artist: "B",
            durationMs: 1000,
            trackNumber: 2,
            isrc: null,
            plays: null,
            inLibrary: true,
            requestId: "r2",
            slskd_request_id: null,
            status: "complete",
            failureReason: null,
          },
        ],
      })
    );
    const { user } = renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Filter and sort" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Name" }));

    const ascTitles = screen.getAllByText(/Apple|Banana/).map((node) => node.textContent);
    expect(ascTitles).toEqual(["Apple", "Banana"]);

    await user.click(screen.getByRole("button", { name: "Filter and sort" }));
    await user.click(screen.getByRole("button", { name: "Descending" }));

    const descTitles = screen.getAllByText(/Apple|Banana/).map((node) => node.textContent);
    expect(descTitles).toEqual(["Banana", "Apple"]);
  });
});
