import { SubscriptionEventType, type UserActivityPayload } from "@api/__generated__/types";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const FAVORITES_PATH = vi.hoisted(() => ["playback", "favoriteTrackIds"]);

vi.mock("@trpc/react-query", () => ({ getQueryKey: () => [FAVORITES_PATH] }));
vi.mock("@utils/trpc", () => ({ trpc: { playback: { favoriteTrackIds: {} } } }));

import { handleUserActivity } from "../userActivity";

const invalidateFavorites = vi.fn();
const invalidateConnections = vi.fn();

const utils = {
  playback: {
    favoriteTrackIds: { invalidate: invalidateFavorites },
    scrobble: { connections: { invalidate: invalidateConnections } },
  },
};

function keyFor(trackIds: string[]) {
  return [FAVORITES_PATH, { input: { trackIds }, type: "query" }];
}

function favorites(favoriteTracks?: UserActivityPayload["favoriteTracks"]): UserActivityPayload {
  return {
    eventType: SubscriptionEventType.UserActivity,
    userId: "u1",
    subject: "favorites",
    ...(favoriteTracks ? { favoriteTracks } : {}),
  };
}

let client: QueryClient;

beforeEach(() => {
  vi.clearAllMocks();
  client = new QueryClient();
});

describe("handleUserActivity", () => {
  it("marks a track favorite in every answer that asked about it, and asks the server for nothing", () => {
    client.setQueryData(keyFor(["t1"]), []);
    client.setQueryData(keyFor(["t1", "t2"]), ["t2"]);
    client.setQueryData(keyFor(["t9"]), ["t9"]);

    handleUserActivity(favorites({ trackIds: ["t1"], favorite: true }), utils, client);

    expect(client.getQueryData(keyFor(["t1"]))).toEqual(["t1"]);
    expect(client.getQueryData(keyFor(["t1", "t2"]))).toEqual(["t2", "t1"]);
    expect(client.getQueryData(keyFor(["t9"]))).toEqual(["t9"]);
    expect(invalidateFavorites).not.toHaveBeenCalled();
  });

  it("rereads an answer whose question it cannot read, instead of leaving it stale", () => {
    const unreadable = [FAVORITES_PATH, { type: "query" }];
    client.setQueryData(unreadable, ["t9"]);
    client.setQueryData(keyFor(["t1"]), []);

    handleUserActivity(favorites({ trackIds: ["t1"], favorite: true }), utils, client);

    expect(client.getQueryState(unreadable)?.isInvalidated).toBe(true);
    expect(client.getQueryState(keyFor(["t1"]))?.isInvalidated).toBe(false);
    expect(client.getQueryData(keyFor(["t1"]))).toEqual(["t1"]);
  });

  it("takes the mark off again, and never lists a track twice when it is marked twice", () => {
    client.setQueryData(keyFor(["t1", "t2"]), ["t1", "t2"]);

    handleUserActivity(favorites({ trackIds: ["t1"], favorite: true }), utils, client);

    expect(client.getQueryData(keyFor(["t1", "t2"]))).toEqual(["t2", "t1"]);

    handleUserActivity(favorites({ trackIds: ["t1"], favorite: false }), utils, client);

    expect(client.getQueryData(keyFor(["t1", "t2"]))).toEqual(["t2"]);
  });

  it("never adds a track to an answer that did not ask about it", () => {
    client.setQueryData(keyFor(["t2"]), []);

    handleUserActivity(favorites({ trackIds: ["t1"], favorite: true }), utils, client);

    expect(client.getQueryData(keyFor(["t2"]))).toEqual([]);
  });

  it("asks the server when a favorites event does not say which tracks changed", () => {
    handleUserActivity(favorites(), utils, client);

    expect(invalidateFavorites).toHaveBeenCalledTimes(1);
  });

  it("rereads the listening services when those changed", () => {
    handleUserActivity(
      { eventType: SubscriptionEventType.UserActivity, userId: "u1", subject: "listeningServices" },
      utils,
      client
    );

    expect(invalidateConnections).toHaveBeenCalledTimes(1);
    expect(invalidateFavorites).not.toHaveBeenCalled();
  });
});
