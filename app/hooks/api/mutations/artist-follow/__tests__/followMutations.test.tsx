import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FakeFollowServer, FakeServerFailure } from "@test/follow-server";

const toasts = vi.hoisted(() => ({
  success: vi.fn<(message: string, options: { action: { onClick: () => void } }) => void>(),
  error: vi.fn<(message: string) => void>(),
  info: vi.fn<(message: string) => void>(),
}));

vi.mock("sonner", () => ({ toast: toasts }));

import { useFollowStatus } from "@hooks/api/queries/artist-follow/useFollowStatus";

import { useFollowArtist } from "../useFollowArtist";
import { useUnfollowArtists } from "../useUnfollowArtists";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useUnfollowArtists", () => {
  it("restores the original followedAt and automatic-request choice when Undo is pressed", async () => {
    const followedAt = new Date("2026-03-02T10:00:00Z");
    const unfollowed = [
      { catalogArtistId: "a1", followedAt, autoRequest: true },
      { catalogArtistId: "a2", followedAt, autoRequest: false },
    ];
    const server = new FakeFollowServer()
      .on("artistFollow.unfollow", () => ({ unfollowed }))
      .on("artistFollow.restore", () => ({ restored: 2 }));
    const { result } = renderHook(() => useUnfollowArtists(), { wrapper: server.wrapper() });

    await act(async () => {
      await result.current.unfollow([
        { catalogArtistId: "a1", name: "Ada" },
        { catalogArtistId: "a2", name: "Bea" },
      ]);
    });
    const options = toasts.success.mock.calls[0]?.[1];
    act(() => options?.action.onClick());

    await waitFor(() => expect(server.callsTo("artistFollow.restore")).toHaveLength(1));
    expect(server.callsTo("artistFollow.restore")[0]?.input).toEqual({ follows: unfollowed });
    expect(server.callsTo("artistFollow.follow")).toHaveLength(0);
  });

  it("offers no Undo when the server unfollowed nothing", async () => {
    const server = new FakeFollowServer().on("artistFollow.unfollow", () => ({ unfollowed: [] }));
    const { result } = renderHook(() => useUnfollowArtists(), { wrapper: server.wrapper() });

    await act(async () => {
      await result.current.unfollow([{ catalogArtistId: "a1", name: "Ada" }]);
    });

    expect(toasts.success).not.toHaveBeenCalled();
  });
});

describe("useFollowArtist", () => {
  it("shows the artist as followed at once and rolls back when the server refuses", async () => {
    let refuse: () => void = () => undefined;
    let statusCalls = 0;
    const server = new FakeFollowServer()
      .on("artistFollow.status", () => {
        statusCalls += 1;
        return statusCalls === 1
          ? { followable: true, following: false, autoRequest: false, followedAt: null }
          : new Promise(() => undefined);
      })
      .on(
        "artistFollow.follow",
        () =>
          new Promise((_resolve, reject) => {
            refuse = () => reject(new FakeServerFailure("boom"));
          })
      );
    const { result } = renderHook(() => ({ status: useFollowStatus("a1"), follow: useFollowArtist("Ada") }), {
      wrapper: server.wrapper(),
    });
    await waitFor(() => expect(result.current.status.data?.following).toBe(false));

    act(() => result.current.follow.mutate({ catalogArtistId: "a1", autoRequest: false }));
    await waitFor(() => expect(result.current.status.data?.following).toBe(true));

    await act(async () => refuse());
    await waitFor(() => expect(result.current.status.data?.following).toBe(false));
    expect(toasts.error).toHaveBeenCalledWith(expect.stringContaining("Ada"));
  });
});
