import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen, within } from "@test/test-utils";
import type { DetailTarget } from "../../../types";

const usePlaylistDetailMock = vi.fn();
const removeMutate = vi.fn();
const setSyncMutate = vi.fn();
const renameMutate = vi.fn();
const deleteMutate = vi.fn();

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
  useSetPlaylistSync: () => ({ mutate: setSyncMutate, isPending: false }),
}));

vi.mock("@hooks/api/mutations/playlists/useRenamePlaylist", () => ({
  useRenamePlaylist: () => ({ mutate: renameMutate, isPending: false }),
}));

vi.mock("@hooks/api/mutations/playlists/useDeletePlaylist", () => ({
  useDeletePlaylist: () => ({ mutate: deleteMutate, isPending: false }),
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

function playlistDetail(overrides?: Partial<Record<string, unknown>>) {
  return {
    data: {
      id: "pl-1",
      name: "Road Trip",
      cover: null,
      sourceProvider: null,
      syncEnabled: false,
      totalTracks: 2,
      libraryTrackCount: 2,
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
  });

  it("enables rename for a local playlist and submits the new name", async () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail());
    const onClose = vi.fn();
    const { user } = renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={onClose} />);

    const renameButton = screen.getByRole("button", { name: "Rename" });
    expect(renameButton).toBeEnabled();

    await user.click(renameButton);
    const dialog = screen.getByRole("dialog");
    const input = within(dialog).getByLabelText("Playlist name");
    await user.clear(input);
    await user.type(input, "Summer Mix");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(renameMutate).toHaveBeenCalledWith({ playlistId: "pl-1", name: "Summer Mix" }, expect.anything());
  });

  it("only marks complete/failed rows selectable for removal", () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail());
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} />);

    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("disables rename when imported and syncing", () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail({ sourceProvider: "spotify", syncEnabled: true }));
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Rename" })).toBeDisabled();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("re-enables editing when an imported playlist has sync off", () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail({ sourceProvider: "spotify", syncEnabled: false }));
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Rename" })).toBeEnabled();
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("toggles sync via the keep-in-sync switch on an imported playlist", async () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail({ sourceProvider: "spotify", syncEnabled: false }));
    const { user } = renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} />);

    await user.click(screen.getByRole("switch"));

    expect(setSyncMutate).toHaveBeenCalledWith({ playlistId: "pl-1", enabled: true });
  });

  it("clears the track selection when the keep-in-sync switch flips", async () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail({ sourceProvider: "spotify", syncEnabled: false }));
    const { user } = renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} />);

    await user.click(screen.getByLabelText("Select all"));
    expect(screen.getByText("selected")).toBeInTheDocument();

    await user.click(screen.getByRole("switch"));

    expect(screen.queryByText("selected")).not.toBeInTheDocument();
  });
});
