import { beforeEach, describe, expect, it, vi } from "vitest";

import enContentDetail from "@modules/i18n/messages/en/contentDetail.json";
import { renderWithProviders, screen } from "@test/test-utils";
import type { DetailTarget } from "../../../types";

const usePlaylistDetailMock = vi.fn();
const setSyncMutate = vi.fn();
let setSyncPending = false;

vi.mock("@hooks/api", () => ({
  useRetryTracks: () => ({ mutate: vi.fn(), isPending: false, variables: undefined }),
  usePlayableTracksFetcher: () => vi.fn(async () => ({ items: [], truncated: false })),
  useRadioTracksFetcher: () => vi.fn(async () => ({ items: [] })),
}));

const resolveArtistMock = vi.fn();

vi.mock("@hooks/api/queries/content-detail", () => ({
  usePlaylistDetail: (args: { playlistId: string; enabled?: boolean }) => usePlaylistDetailMock(args),
  useCatalogPlaylistTracks: () => ({ data: undefined, isLoading: false }),
  useResolveArtistFetcher: () => resolveArtistMock,
}));

vi.mock("@hooks/api/mutations/playlists/useSetPlaylistSync", () => ({
  useSetPlaylistSync: () => ({ mutate: setSyncMutate, isPending: setSyncPending }),
}));

vi.mock("../../../ContentDetailActionsContext", () => ({
  useContentDetailActions: () => ({ requestPlaylist: vi.fn(), requestTrack: vi.fn() }),
}));

vi.mock("../../../ContentDetailCloseContext", () => ({ useContentDetailClose: () => vi.fn() }));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: { role: "admin" } }),
}));

const playback = vi.hoisted(() => ({
  playEntity: vi.fn(async () => false),
  shuffleEntity: vi.fn(async () => false),
  enqueueEntity: vi.fn(async () => true),
}));

const PLAY = "Play everything we have of Road Trip";
const MORE = "More ways to listen to Road Trip";

vi.mock("@hooks/ui/useEntityPlayback", () => ({ useEntityPlayback: () => playback }));

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
      origin: { kind: "created" },
      syncEnabled: false,
      visibility: "shared",
      canManage: true,
      ownedByViewer: true,
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

describe("PlaylistDetailBody shuffle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePlaylistDetailMock.mockReturnValue(playlistDetail());
  });

  it("shuffles a library playlist from the menu behind Play", async () => {
    const { user } = renderWithProviders(
      <PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={vi.fn()} />
    );

    await user.click(screen.getByRole("button", { name: MORE }));
    await user.click(screen.getByRole("menuitem", { name: "Shuffle" }));

    expect(playback.shuffleEntity).toHaveBeenCalledWith({ kind: "playlist", playlistId: "pl-1" });
    expect(playback.playEntity).not.toHaveBeenCalled();
  });

  it("closes the modal once Play has started, and keeps it open when it could not", async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <PlaylistDetailBody target={libraryTarget()} onClose={onClose} onNavigate={vi.fn()} />
    );

    await user.click(screen.getByRole("button", { name: PLAY }));
    expect(onClose).not.toHaveBeenCalled();

    playback.playEntity.mockResolvedValueOnce(true);
    await user.click(screen.getByRole("button", { name: PLAY }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes the modal once a shuffle has started, and keeps it open when it could not", async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <PlaylistDetailBody target={libraryTarget()} onClose={onClose} onNavigate={vi.fn()} />
    );

    await user.click(screen.getByRole("button", { name: MORE }));
    await user.click(screen.getByRole("menuitem", { name: "Shuffle" }));
    expect(onClose).not.toHaveBeenCalled();

    playback.shuffleEntity.mockResolvedValueOnce(true);
    await user.click(screen.getByRole("button", { name: MORE }));
    await user.click(screen.getByRole("menuitem", { name: "Shuffle" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("adds a library playlist to the queue and leaves the modal open", async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <PlaylistDetailBody target={libraryTarget()} onClose={onClose} onNavigate={vi.fn()} />
    );

    await user.click(screen.getByRole("button", { name: MORE }));
    await user.click(screen.getByRole("menuitem", { name: "Add to queue" }));

    expect(playback.enqueueEntity).toHaveBeenCalledWith({ kind: "playlist", playlistId: "pl-1" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows how many tracks the playlist holds beside its name", () => {
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={vi.fn()} />);

    expect(screen.getByRole("banner")).toHaveTextContent("2Tracks");
  });

  it("offers no way to listen for a catalog playlist it cannot play", () => {
    usePlaylistDetailMock.mockReturnValue({ data: undefined });
    renderWithProviders(<PlaylistDetailBody target={catalogTarget()} onClose={vi.fn()} onNavigate={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "Play everything we have of Top Hits" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "More ways to listen to Top Hits" })).not.toBeInTheDocument();
  });
});

describe("PlaylistDetailBody editing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setSyncPending = false;
  });

  it("opens the workshop from the wrench beside the request button", async () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail());
    const onOpenWorkshop = vi.fn();
    const { user } = renderWithProviders(
      <PlaylistDetailBody
        target={libraryTarget()}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
        onOpenWorkshop={onOpenWorkshop}
      />
    );

    await user.click(screen.getByRole("button", { name: enContentDetail.workshop.open }));

    expect(onOpenWorkshop).toHaveBeenCalledTimes(1);
  });

  it("keeps editing out of the normal view: no playlist menu, no name field and no row selection", () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail());
    renderWithProviders(
      <PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={vi.fn()} onOpenWorkshop={vi.fn()} />
    );

    expect(screen.queryByRole("button", { name: "Playlist actions for Road Trip" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Playlist name")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("counts on the request button the tracks a request would take, not the ones already on their way", () => {
    const [first, second] = playlistDetail().data.tracks;
    usePlaylistDetailMock.mockReturnValue(
      playlistDetail({
        tracks: [
          first,
          { ...second, status: "failed" },
          { ...second, externalId: "t3", requestId: "r3", title: "Third", status: "downloading" },
          { ...second, externalId: "t4", requestId: null, title: "Fourth", status: null },
        ],
      })
    );
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={vi.fn()} />);

    expect(screen.getByRole("banner")).toHaveTextContent(
      `${enContentDetail.requestMissing}${enContentDetail.request}2`
    );
  });

  it("lists a library playlist in its own order, numbered from one", () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail());
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={vi.fn()} />);

    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent(/^1.*First/);
    expect(rows[1]).toHaveTextContent(/^2.*Second/);
  });

  it("says a playlist made in Synthseek was created here, in place of a track count", () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail());
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={vi.fn()} />);

    expect(screen.getByText("Created in Synthseek")).toBeInTheDocument();
    expect(screen.queryByText("2 tracks")).not.toBeInTheDocument();
  });

  it("shows the capitalized imported-provider origin subtitle for an imported library playlist", () => {
    usePlaylistDetailMock.mockReturnValue(
      playlistDetail({ sourceProvider: "spotify", origin: { kind: "imported", provider: "spotify" } })
    );
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={vi.fn()} />);

    expect(screen.getByText("Imported: Spotify")).toBeInTheDocument();
  });

  it.each([
    [{ kind: "catalog", provider: "deezer" }, "Requested from Deezer"],
    [{ kind: "discovery", service: "listenbrainz" }, "From ListenBrainz"],
    [{ kind: "file" }, "Imported from a file"],
  ])("says where a playlist without a library source came from (%j)", (origin, label) => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail({ origin }));
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={vi.fn()} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("keeps the track-count subtitle for a catalog playlist", () => {
    usePlaylistDetailMock.mockReturnValue({ data: undefined });
    renderWithProviders(<PlaylistDetailBody target={catalogTarget()} onClose={vi.fn()} onNavigate={vi.fn()} />);

    expect(screen.getByText("0 tracks")).toBeInTheDocument();
    expect(screen.queryByText("Local")).not.toBeInTheDocument();
  });

  it("renders the keep-in-sync control as a sync icon plus a switch for an imported playlist", () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail({ sourceProvider: "spotify", syncEnabled: false }));
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={vi.fn()} />);

    const toggle = screen.getByRole("switch", { name: "Keep in sync" });
    expect(toggle).toBeInTheDocument();
    expect(toggle.tagName).toBe("BUTTON");
    expect(screen.queryByText("Keep in sync")).not.toBeInTheDocument();
  });

  it("does not render the keep-in-sync switch for a local library playlist", () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail());
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={vi.fn()} />);

    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("toggles sync via the keep-in-sync switch on an imported playlist", async () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail({ sourceProvider: "spotify", syncEnabled: false }));
    const { user } = renderWithProviders(
      <PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={vi.fn()} />
    );

    await user.click(screen.getByRole("switch"));

    expect(setSyncMutate).toHaveBeenCalledWith({ playlistId: "pl-1", enabled: true });
  });

  it("disables the keep-in-sync switch while the sync mutation is pending", () => {
    setSyncPending = true;
    usePlaylistDetailMock.mockReturnValue(playlistDetail({ sourceProvider: "spotify", syncEnabled: false }));
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={vi.fn()} />);

    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("shows the already-in-library pill by default but hides it when showInLibraryPill is false", () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail());
    const { rerender } = renderWithProviders(
      <PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={vi.fn()} showInLibraryPill />
    );
    expect(screen.getByRole("img", { name: "Already in library" })).toBeInTheDocument();
    expect(screen.queryByText("Already in library")).not.toBeInTheDocument();

    rerender(
      <PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={vi.fn()} showInLibraryPill={false} />
    );
    expect(screen.queryByRole("img", { name: "Already in library" })).not.toBeInTheDocument();
  });

  it("offers to request a cancelled track while another one is still downloading", () => {
    const [complete, downloading] = playlistDetail().data.tracks;
    usePlaylistDetailMock.mockReturnValue(
      playlistDetail({
        totalTracks: 3,
        tracks: [
          { ...complete, status: "downloading", inLibrary: false },
          downloading,
          { ...complete, externalId: "t3", title: "Third", requestId: "r3", status: "cancelled", inLibrary: false },
        ],
      })
    );
    renderWithProviders(
      <PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={vi.fn()} showInLibraryPill />
    );

    expect(screen.getByRole("button", { name: new RegExp(enContentDetail.requestMissing) })).toBeEnabled();
    expect(screen.queryByRole("img", { name: "Already in library" })).not.toBeInTheDocument();
  });

  it.each([
    { who: "a member who only sees it", canManage: false },
    { who: "an admin who manages it", canManage: true },
  ])("locks the request for $who, since requesting would take the playlist from its owner", ({ canManage }) => {
    const [complete, downloading] = playlistDetail().data.tracks;
    usePlaylistDetailMock.mockReturnValue(
      playlistDetail({
        canManage,
        ownedByViewer: false,
        totalTracks: 3,
        tracks: [
          complete,
          downloading,
          { ...complete, externalId: "t3", title: "Third", requestId: "r3", status: "cancelled", inLibrary: false },
        ],
      })
    );
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={vi.fn()} />);

    const request = screen.getByRole("button", { name: new RegExp(enContentDetail.requestMissing) });
    expect(request).toBeDisabled();
    expect(screen.getByTitle(enContentDetail.requestOwnerOnly)).toContainElement(request);
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
    const { user } = renderWithProviders(
      <PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={vi.fn()} />
    );

    await user.click(screen.getByRole("button", { name: "Filter and sort" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Name" }));

    const ascTitles = screen.getAllByText(/Apple|Banana/).map((node) => node.textContent);
    expect(ascTitles).toEqual(["Apple", "Banana"]);

    await user.click(screen.getByRole("button", { name: "Filter and sort" }));
    await user.click(screen.getByRole("button", { name: "Descending" }));

    const descTitles = screen.getAllByText(/Apple|Banana/).map((node) => node.textContent);
    expect(descTitles).toEqual(["Banana", "Apple"]);
  });

  it("offers no workshop for a playlist the viewer cannot manage", () => {
    usePlaylistDetailMock.mockReturnValue(playlistDetail({ canManage: false }));
    renderWithProviders(
      <PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={vi.fn()} onOpenWorkshop={vi.fn()} />
    );

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: enContentDetail.workshop.open })).not.toBeInTheDocument();
  });
});

describe("PlaylistDetailBody failed load", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("says the playlist could not be loaded instead of loading forever, and offers nothing to act on", () => {
    usePlaylistDetailMock.mockReturnValue({ data: undefined, isError: true });
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={vi.fn()} />);

    expect(screen.getByRole("alert")).toHaveTextContent(enContentDetail.loadFailed);
    expect(screen.queryByRole("button", { name: /Request/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Play everything we have of/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Shuffle everything we have of/ })).not.toBeInTheDocument();
  });

  it("keeps showing a playlist it already has when a later refresh fails", () => {
    usePlaylistDetailMock.mockReturnValue({ ...playlistDetail(), isError: true });
    renderWithProviders(<PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={vi.fn()} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("First")).toBeInTheDocument();
  });
});

describe("PlaylistDetailBody artist links", () => {
  function rowBy(artistExternalId: string | null) {
    return playlistDetail({
      tracks: [
        {
          externalId: "t1",
          title: "Digital Love",
          artist: "Daft Punk",
          artistExternalId,
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
      ],
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens the artist in the same modal when the row carries its catalog id", async () => {
    usePlaylistDetailMock.mockReturnValue(rowBy("27"));
    const onNavigate = vi.fn();
    const { user } = renderWithProviders(
      <PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={onNavigate} />
    );

    await user.click(screen.getByRole("button", { name: "View artist Daft Punk" }));

    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ mode: "artist", id: "27", name: "Daft Punk" }));
    expect(resolveArtistMock).not.toHaveBeenCalled();
  });

  it("finds the artist by name first when a library row has no catalog id", async () => {
    usePlaylistDetailMock.mockReturnValue(rowBy(null));
    resolveArtistMock.mockResolvedValue({ catalogArtistId: "27", name: "Daft Punk", image: "/dp.jpg" });
    const onNavigate = vi.fn();
    const { user } = renderWithProviders(
      <PlaylistDetailBody target={libraryTarget()} onClose={vi.fn()} onNavigate={onNavigate} />
    );

    await user.click(screen.getByRole("button", { name: "View artist Daft Punk" }));

    await vi.waitFor(() =>
      expect(onNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ mode: "artist", id: "27", name: "Daft Punk", cover: "/dp.jpg" })
      )
    );
    expect(resolveArtistMock).toHaveBeenCalledWith("Daft Punk");
  });
});
