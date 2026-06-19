import { ContentType, type PublicUser, RequestStatus, type RequestWithTracks, Role } from "@api/__generated__/types";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SortField, type SortConfig } from "../../types";
import { useFilteredRequests } from "../useFilteredRequests";

const ownerId = "user-1";

const owner: PublicUser = {
  id: ownerId,
  email: "owner@example.com",
  username: "owner",
  avatar_url: null,
  role: Role.enum.member,
  language: "en",
  plex_username: null,
  plexLinked: false,
  hasPassword: true,
  created_at: new Date(),
};

function makeRequest(overrides: Partial<RequestWithTracks> = {}): RequestWithTracks {
  return {
    id: "req-1",
    external_id: "ext-1",
    name: "A Request",
    artist: "An Artist",
    album_art: null,
    user_id: ownerId,
    release_date: "2024-01-01",
    total_tracks: 10,
    completed_tracks: 10,
    status: RequestStatus.enum.complete,
    genres: null,
    upc: null,
    delegated_to: null,
    source_provider: "deezer",
    source_id: null,
    auto_imported: false,
    created_at: new Date(),
    updated_at: new Date(),
    tracks: [],
    contentType: ContentType.enum.album,
    plex_playlist_id: null,
    duplicateCount: 0,
    requestedBy: owner,
    ...overrides,
  };
}

const recentDesc: SortConfig = { field: SortField.RECENT, direction: "desc" };

describe("useFilteredRequests default recency sort", () => {
  it("orders by updated_at desc so a re-requested item bumps to the top", () => {
    const oldUpdate = makeRequest({
      id: "old-update",
      name: "Created Last But Stale",
      created_at: new Date("2024-03-01T00:00:00Z"),
      updated_at: new Date("2024-03-01T00:00:00Z"),
    });
    const bumped = makeRequest({
      id: "bumped",
      name: "Created First But Re-Requested",
      created_at: new Date("2024-01-01T00:00:00Z"),
      updated_at: new Date("2024-06-01T00:00:00Z"),
    });

    const { result } = renderHook(() => useFilteredRequests([oldUpdate, bumped], "all", recentDesc, ""));

    expect(result.current.map((item) => item.id)).toEqual(["bumped", "old-update"]);
  });

  it("does not key recency on created_at", () => {
    const newerCreatedStaleUpdate = makeRequest({
      id: "newer-created",
      created_at: new Date("2024-12-01T00:00:00Z"),
      updated_at: new Date("2024-01-01T00:00:00Z"),
    });
    const olderCreatedFreshUpdate = makeRequest({
      id: "older-created",
      created_at: new Date("2024-01-01T00:00:00Z"),
      updated_at: new Date("2024-12-31T00:00:00Z"),
    });

    const { result } = renderHook(() =>
      useFilteredRequests([newerCreatedStaleUpdate, olderCreatedFreshUpdate], "all", recentDesc, "")
    );

    expect(result.current[0]?.id).toBe("older-created");
  });

  it("respects ascending direction on updated_at", () => {
    const first = makeRequest({ id: "first", updated_at: new Date("2024-01-01T00:00:00Z") });
    const second = makeRequest({ id: "second", updated_at: new Date("2024-06-01T00:00:00Z") });

    const ascending: SortConfig = { field: SortField.RECENT, direction: "asc" };
    const { result } = renderHook(() => useFilteredRequests([second, first], "all", ascending, ""));

    expect(result.current.map((item) => item.id)).toEqual(["first", "second"]);
  });
});
