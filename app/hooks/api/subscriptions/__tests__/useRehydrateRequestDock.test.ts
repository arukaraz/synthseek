import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  correlateDockJob,
  findRunningRequestJobId,
  resetDockStore,
  seedDockJob,
  buildDockItems,
} from "../shared/progressDock";
import { useRehydrateRequestDock } from "../useRehydrateRequestDock";

interface PopulatingPlaylist {
  playlistId: string;
  name: string;
  totalTracks: number;
}

const queryState = vi.hoisted(() => ({ data: undefined as PopulatingPlaylist[] | undefined }));

vi.mock("@utils/trpc", () => ({
  trpc: {
    requests: {
      getPopulatingPlaylists: {
        useQuery: () => ({ data: queryState.data }),
      },
    },
  },
}));

beforeEach(() => {
  resetDockStore();
  queryState.data = undefined;
});

afterEach(() => {
  resetDockStore();
  vi.clearAllMocks();
});

describe("useRehydrateRequestDock", () => {
  it("seeds a running request job per populating playlist and correlates it by playlistId", () => {
    queryState.data = [
      { playlistId: "pl_a", name: "Road Trip", totalTracks: 12 },
      { playlistId: "pl_b", name: "Focus", totalTracks: 30 },
    ];

    renderHook(() => useRehydrateRequestDock());

    expect(findRunningRequestJobId("pl_a")).not.toBeNull();
    expect(findRunningRequestJobId("pl_b")).not.toBeNull();
  });

  it("does nothing while the query has no data yet", () => {
    queryState.data = undefined;
    renderHook(() => useRehydrateRequestDock());
    expect(findRunningRequestJobId("pl_a")).toBeNull();
  });

  it("does not duplicate a card when a running request job already exists for that playlist", () => {
    seedDockJob({
      id: "existing-job",
      kind: "request",
      items: buildDockItems([{ key: "track-0", name: "Road Trip" }]),
      status: "running",
    });
    correlateDockJob("existing-job", "pl_a");
    queryState.data = [{ playlistId: "pl_a", name: "Road Trip", totalTracks: 12 }];

    renderHook(() => useRehydrateRequestDock());

    expect(findRunningRequestJobId("pl_a")).toBe("existing-job");
  });

  it("seeds only the playlists not already present, leaving the existing one untouched", () => {
    seedDockJob({
      id: "existing-job",
      kind: "request",
      items: buildDockItems([{ key: "track-0", name: "Road Trip" }]),
      status: "running",
    });
    correlateDockJob("existing-job", "pl_a");
    queryState.data = [
      { playlistId: "pl_a", name: "Road Trip", totalTracks: 12 },
      { playlistId: "pl_b", name: "Focus", totalTracks: 30 },
    ];

    renderHook(() => useRehydrateRequestDock());

    expect(findRunningRequestJobId("pl_a")).toBe("existing-job");
    const seededB = findRunningRequestJobId("pl_b");
    expect(seededB).not.toBeNull();
    expect(seededB).not.toBe("existing-job");
  });

  it("is idempotent across re-renders of the same data", () => {
    queryState.data = [{ playlistId: "pl_a", name: "Road Trip", totalTracks: 12 }];

    const { rerender } = renderHook(() => useRehydrateRequestDock());
    const firstId = findRunningRequestJobId("pl_a");
    rerender();
    expect(findRunningRequestJobId("pl_a")).toBe(firstId);
  });
});
