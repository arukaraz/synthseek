import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  SubscriptionEventType,
  type LibraryImportProgressPayload,
  type PlaylistSyncAllProgressPayload,
  type PortabilityProgressPayload,
  type SubscriptionEvent,
} from "@api/__generated__/types";
import { renderHookWithProviders } from "@test/test-utils";

import { useSubscriptions } from "../useSubscriptions";
import { resetThrottledInvalidations } from "../shared/throttledInvalidation";

const auth = vi.hoisted(() => ({ currentUser: null as { id: string } | null }));

const captured = vi.hoisted(() => ({
  input: undefined as { deviceId: string } | undefined,
  enabled: false,
  onData: null as ((event: SubscriptionEvent) => void) | null,
  onStarted: null as (() => void) | null,
}));

const handlers = vi.hoisted(() => ({
  plexSyncAll: vi.fn(),
  portability: vi.fn(),
  libraryImport: vi.fn(),
  releaseProgress: vi.fn(),
}));

const utilsStub = vi.hoisted(() => ({
  requests: {
    getAll: { invalidate: vi.fn() },
    getRecentTracks: { invalidate: vi.fn() },
    getDetail: { invalidate: vi.fn() },
    getLibrarySummary: { invalidate: vi.fn() },
    getPlaylistSyncAllItems: { invalidate: vi.fn() },
    getPlaylistSyncAllState: { invalidate: vi.fn() },
    playlistSyncTargets: { invalidate: vi.fn() },
    review: { list: { invalidate: vi.fn() } },
    activeReleases: { invalidate: vi.fn() },
    keptReleases: { invalidate: vi.fn() },
  },
  settings: {
    get: { invalidate: vi.fn() },
    recycleBin: { list: { invalidate: vi.fn() }, status: { invalidate: vi.fn() } },
    stagedReleases: { list: { invalidate: vi.fn() } },
    quarantine: { list: { invalidate: vi.fn() } },
  },
  maintenance: {
    counts: { invalidate: vi.fn() },
    systemStatus: { invalidate: vi.fn() },
  },
  import: {
    listBatches: { invalidate: vi.fn() },
    getBatch: { invalidate: vi.fn() },
  },
  playback: {
    activeState: { refetch: vi.fn() },
    favoriteTrackIds: { invalidate: vi.fn() },
    scrobble: { connections: { invalidate: vi.fn() } },
    listeningNow: { invalidate: vi.fn(), setData: vi.fn() },
  },
  library: {
    getAlbums: { invalidate: vi.fn() },
    getArtists: { invalidate: vi.fn() },
    getPlaylists: { invalidate: vi.fn() },
    getTracks: { invalidate: vi.fn() },
    getCounts: { invalidate: vi.fn() },
    scan: {
      duplicateGroups: { invalidate: vi.fn() },
      status: { invalidate: vi.fn() },
      unidentified: { list: { invalidate: vi.fn() } },
    },
  },
}));

const everyPushFedInvalidate = [
  utilsStub.requests.getAll.invalidate,
  utilsStub.requests.getLibrarySummary.invalidate,
  utilsStub.requests.getPlaylistSyncAllItems.invalidate,
  utilsStub.requests.getPlaylistSyncAllState.invalidate,
  utilsStub.requests.playlistSyncTargets.invalidate,
  utilsStub.settings.get.invalidate,
  utilsStub.import.listBatches.invalidate,
  utilsStub.import.getBatch.invalidate,
  utilsStub.maintenance.counts.invalidate,
  utilsStub.maintenance.systemStatus.invalidate,
  utilsStub.requests.review.list.invalidate,
  utilsStub.library.scan.duplicateGroups.invalidate,
  utilsStub.library.scan.status.invalidate,
  utilsStub.library.scan.unidentified.list.invalidate,
  utilsStub.settings.recycleBin.list.invalidate,
  utilsStub.settings.recycleBin.status.invalidate,
  utilsStub.settings.stagedReleases.list.invalidate,
  utilsStub.requests.activeReleases.invalidate,
  utilsStub.requests.keptReleases.invalidate,
  utilsStub.settings.quarantine.list.invalidate,
  utilsStub.playback.favoriteTrackIds.invalidate,
  utilsStub.playback.scrobble.connections.invalidate,
  utilsStub.playback.listeningNow.invalidate,
  utilsStub.library.getAlbums.invalidate,
  utilsStub.library.getArtists.invalidate,
  utilsStub.library.getPlaylists.invalidate,
  utilsStub.library.getTracks.invalidate,
  utilsStub.library.getCounts.invalidate,
];

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({
    currentUser: auth.currentUser,
    isLoading: false,
    isError: false,
    isAdmin: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => utilsStub,
    subscriptionEvents: {
      onEvent: {
        useSubscription: (
          input: { deviceId: string } | undefined,
          opts: { enabled: boolean; onData: (event: SubscriptionEvent) => void; onStarted: () => void }
        ) => {
          captured.input = input;
          captured.enabled = opts.enabled;
          captured.onData = opts.onData;
          captured.onStarted = opts.onStarted;
        },
      },
    },
  },
}));

vi.mock("../handlers/requests", () => ({
  handleAlbumUpdate: vi.fn(),
  handleDropImportUpdate: vi.fn(),
  handleLibraryImportProgress: handlers.libraryImport,
  handlePlaylistPlexCreated: vi.fn(),
  handlePlaylistUpdate: vi.fn(),
  handlePlaylistSyncAllProgress: handlers.plexSyncAll,
  handlePortabilityProgress: handlers.portability,
  handleReleaseProgress: handlers.releaseProgress,
  handleTrackUpdate: vi.fn(),
}));

vi.mock("../handlers/system", async () => {
  const actual = await vi.importActual<typeof import("../handlers/system/listeningNowUpdate")>(
    "../handlers/system/listeningNowUpdate"
  );
  return {
    handleSettingsUpdate: vi.fn(),
    handleVersionUpdate: vi.fn(),
    handleListeningNowUpdate: actual.handleListeningNowUpdate,
  };
});

const plexEvent: PlaylistSyncAllProgressPayload = {
  eventType: SubscriptionEventType.PlaylistSyncAllProgress,
  userId: "u_other",
  server: "plex",
  phase: "start",
  synced: 0,
  total: 1,
  items: [{ id: "pl_1", name: "Road Trip" }],
};

const portabilityEvent: PortabilityProgressPayload = {
  eventType: SubscriptionEventType.PortabilityProgress,
  userId: "u_other",
  jobId: "jspf-1",
  phase: "matching",
  processed: 1,
  total: 4,
};

const libraryEvent: LibraryImportProgressPayload = {
  eventType: SubscriptionEventType.LibraryImportProgress,
  userId: "u_other",
  jobId: "lib-1",
  provider: "spotify",
  phase: "complete",
  imported: 1,
  failed: 0,
  total: 1,
};

function emitAll(): void {
  captured.onData?.(plexEvent);
  captured.onData?.(portabilityEvent);
  captured.onData?.(libraryEvent);
}

beforeEach(() => {
  resetThrottledInvalidations();
  auth.currentUser = null;
  captured.onData = null;
  captured.onStarted = null;
  handlers.plexSyncAll.mockReset();
  handlers.portability.mockReset();
  handlers.libraryImport.mockReset();
  for (const invalidate of everyPushFedInvalidate) invalidate.mockReset();
  utilsStub.playback.listeningNow.setData.mockReset();
});

describe("useSubscriptions", () => {
  it("opens the event stream under this tab's device id, so the server knows the tab is gone when it closes", () => {
    renderHookWithProviders(() => useSubscriptions());

    const stored = window.sessionStorage.getItem("synthseek.player.device");
    expect(stored).not.toBeNull();
    expect(captured.input).toEqual({ deviceId: stored });
    expect(captured.enabled).toBe(true);
  });

  it("hands the signed-in user's id to every job-progress handler", () => {
    auth.currentUser = { id: "u_self" };

    renderHookWithProviders(() => useSubscriptions());
    emitAll();

    expect(handlers.plexSyncAll).toHaveBeenCalledWith(plexEvent, utilsStub, "u_self");
    expect(handlers.portability).toHaveBeenCalledWith(portabilityEvent, "u_self");
    expect(handlers.libraryImport).toHaveBeenCalledWith(libraryEvent, utilsStub, "u_self");
  });

  it("hands down a null viewer while no user is resolved", () => {
    renderHookWithProviders(() => useSubscriptions());
    emitAll();

    expect(handlers.plexSyncAll).toHaveBeenCalledWith(plexEvent, utilsStub, null);
    expect(handlers.portability).toHaveBeenCalledWith(portabilityEvent, null);
    expect(handlers.libraryImport).toHaveBeenCalledWith(libraryEvent, utilsStub, null);
  });

  it("leaves a cold cache alone on the first connect", () => {
    renderHookWithProviders(() => useSubscriptions());

    captured.onStarted?.();

    for (const invalidate of everyPushFedInvalidate) expect(invalidate).not.toHaveBeenCalled();
  });

  it("resyncs every push-fed query when the stream reconnects", () => {
    renderHookWithProviders(() => useSubscriptions());

    captured.onStarted?.();
    captured.onStarted?.();

    for (const invalidate of everyPushFedInvalidate) expect(invalidate).toHaveBeenCalledTimes(1);
  });

  it("asks who holds the audio when the stream comes back, since a missed announcement is never replayed", () => {
    utilsStub.playback.activeState.refetch.mockClear();
    renderHookWithProviders(() => useSubscriptions());

    captured.onStarted?.();
    expect(utilsStub.playback.activeState.refetch).not.toHaveBeenCalled();

    captured.onStarted?.();
    expect(utilsStub.playback.activeState.refetch).toHaveBeenCalledTimes(1);
  });

  it("hands a release's progress to its handler, with the cache it patches", () => {
    handlers.releaseProgress.mockReset();
    renderHookWithProviders(() => useSubscriptions());
    const event: SubscriptionEvent = {
      eventType: SubscriptionEventType.ReleaseProgress,
      userId: "u_self",
      source: "torrent",
      releaseKey: "album|300",
      release: null,
    };

    captured.onData?.(event);

    expect(handlers.releaseProgress).toHaveBeenCalledWith(event, expect.anything());
  });

  it("refreshes the library once when an album's tracks complete in a run, and once more when the run ends", () => {
    vi.useFakeTimers();
    try {
      renderHookWithProviders(() => useSubscriptions());

      for (let track = 0; track < 20; track++) {
        captured.onData?.({
          eventType: SubscriptionEventType.TrackUpdate,
          requestId: `req_${track}`,
          status: "complete",
          message: "done",
        });
      }

      expect(utilsStub.library.getTracks.invalidate).toHaveBeenCalledTimes(1);
      expect(utilsStub.requests.getLibrarySummary.invalidate).toHaveBeenCalledTimes(1);
      expect(utilsStub.requests.keptReleases.invalidate).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(1000);

      expect(utilsStub.library.getTracks.invalidate).toHaveBeenCalledTimes(2);
      expect(utilsStub.requests.getLibrarySummary.invalidate).toHaveBeenCalledTimes(2);
      expect(utilsStub.requests.keptReleases.invalidate).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("refreshes what a request keeps on disk once one of its tracks completes", () => {
    renderHookWithProviders(() => useSubscriptions());

    captured.onData?.({
      eventType: SubscriptionEventType.TrackUpdate,
      requestId: "req_1",
      status: "complete",
      message: "done",
    });

    expect(utilsStub.requests.keptReleases.invalidate).toHaveBeenCalledTimes(1);
  });

  it("writes who is listening from every Listening now event, without the viewer and without asking the server", () => {
    auth.currentUser = { id: "u_self" };
    renderHookWithProviders(() => useSubscriptions());
    const member = (userId: string) => ({
      userId,
      username: userId,
      avatarUrl: null,
      trackId: "t1",
      title: "Airbag",
      artist: "Radiohead",
      album: "OK Computer",
      artworkUrl: null,
      playedAt: new Date(1_000),
      client: null,
      playing: true,
    });

    captured.onData?.({
      eventType: SubscriptionEventType.ListeningNowUpdate,
      members: [member("u_self"), member("u_ana")],
    });
    captured.onData?.({ eventType: SubscriptionEventType.ListeningNowUpdate, members: [member("u_self")] });

    expect(utilsStub.playback.listeningNow.setData).toHaveBeenCalledTimes(2);
    expect(utilsStub.playback.listeningNow.setData).toHaveBeenNthCalledWith(1, undefined, [member("u_ana")]);
    expect(utilsStub.playback.listeningNow.setData).toHaveBeenNthCalledWith(2, undefined, []);
    expect(utilsStub.playback.listeningNow.invalidate).not.toHaveBeenCalled();
  });

  it("asks the server instead when it cannot tell which roster row is the viewer's own", () => {
    renderHookWithProviders(() => useSubscriptions());

    captured.onData?.({ eventType: SubscriptionEventType.ListeningNowUpdate, members: [] });

    expect(utilsStub.playback.listeningNow.setData).not.toHaveBeenCalled();
    expect(utilsStub.playback.listeningNow.invalidate).toHaveBeenCalledTimes(1);
  });

  it("resyncs again on every further reconnect, not only the first one", () => {
    renderHookWithProviders(() => useSubscriptions());

    captured.onStarted?.();
    captured.onStarted?.();
    captured.onStarted?.();

    for (const invalidate of everyPushFedInvalidate) expect(invalidate).toHaveBeenCalledTimes(2);
  });
});
