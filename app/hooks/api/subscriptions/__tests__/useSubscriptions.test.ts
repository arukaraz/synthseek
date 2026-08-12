import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  SubscriptionEventType,
  type LibraryImportProgressPayload,
  type PlexSyncAllProgressPayload,
  type PortabilityProgressPayload,
  type SubscriptionEvent,
} from "@api/__generated__/types";
import { renderHookWithProviders } from "@test/test-utils";

import { useSubscriptions } from "../useSubscriptions";

const auth = vi.hoisted(() => ({ currentUser: null as { id: string } | null }));

const captured = vi.hoisted(() => ({ onData: null as ((event: SubscriptionEvent) => void) | null }));

const handlers = vi.hoisted(() => ({
  plexSyncAll: vi.fn(),
  portability: vi.fn(),
  libraryImport: vi.fn(),
}));

const utilsStub = vi.hoisted(() => ({
  requests: {
    getAll: { invalidate: vi.fn() },
    getLibrarySummary: { invalidate: vi.fn() },
  },
}));

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
        useSubscription: (_input: undefined, opts: { onData: (event: SubscriptionEvent) => void }) => {
          captured.onData = opts.onData;
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
  handlePlexSyncAllProgress: handlers.plexSyncAll,
  handlePortabilityProgress: handlers.portability,
  handleTrackUpdate: vi.fn(),
}));

vi.mock("../handlers/system", () => ({
  handleSettingsUpdate: vi.fn(),
  handleVersionUpdate: vi.fn(),
}));

const plexEvent: PlexSyncAllProgressPayload = {
  eventType: SubscriptionEventType.PlexSyncAllProgress,
  userId: "u_other",
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
  auth.currentUser = null;
  captured.onData = null;
  handlers.plexSyncAll.mockReset();
  handlers.portability.mockReset();
  handlers.libraryImport.mockReset();
});

describe("useSubscriptions", () => {
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
});
