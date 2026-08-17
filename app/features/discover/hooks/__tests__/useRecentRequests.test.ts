import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useRecentRequests } from "../useRecentRequests";

const useRecentTracksMock = vi.fn();

vi.mock("@hooks/api", () => ({
  useRecentTracks: (limit: number) => useRecentTracksMock(limit),
}));

beforeEach(() => {
  useRecentTracksMock.mockReset();
  useRecentTracksMock.mockReturnValue({ data: undefined, isLoading: true, isError: false });
});

describe("useRecentRequests", () => {
  it("asks the server for exactly the number of rows it exposes as its limit", () => {
    const { result } = renderHook(() => useRecentRequests());

    expect(useRecentTracksMock).toHaveBeenCalledWith(result.current.limit);
  });

  it("returns an empty list while data is undefined", () => {
    const { result } = renderHook(() => useRecentRequests());

    expect(result.current.recent).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it("passes the server rows through in the order they arrive", () => {
    const rows = [{ id: "royals" }, { id: "payphone" }];
    useRecentTracksMock.mockReturnValue({ data: rows, isLoading: false, isError: false });

    const { result } = renderHook(() => useRecentRequests());

    expect(result.current.recent.map((row) => row.id)).toEqual(["royals", "payphone"]);
  });

  it("surfaces a failed query", () => {
    useRecentTracksMock.mockReturnValue({ data: undefined, isLoading: false, isError: true });

    const { result } = renderHook(() => useRecentRequests());

    expect(result.current.isError).toBe(true);
    expect(result.current.recent).toEqual([]);
  });
});
