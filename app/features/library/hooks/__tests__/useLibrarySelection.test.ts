import { RequestStatus } from "@api/__generated__/types";
import type { LibraryTrackItem } from "@hooks/api/queries/library/types";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useLibrarySelection } from "../useLibrarySelection";

function makeTrack(id: string, status: RequestStatus): LibraryTrackItem {
  return {
    id,
    external_id: `ext-${id}`,
    title: `Track ${id}`,
    artist: "Artist",
    status,
    source: "deezer",
    format: "mp3",
    request_type: "track",
    bitrate: 320,
    duration_ms: 200000,
    track_number: 1,
    disc_number: 1,
    explicit: false,
    album_id: "album-1",
    albumName: "Album",
    albumArt: null,
    genres: [],
    playlistIds: [],
    created_at: new Date(),
    completed_at: null,
  };
}

describe("useLibrarySelection", () => {
  it("toggles a single id on and off", () => {
    const { result } = renderHook(() => useLibrarySelection());

    act(() => result.current.toggle("a"));
    expect(result.current.isSelected("a")).toBe(true);
    expect(result.current.selectedCount).toBe(1);

    act(() => result.current.toggle("a"));
    expect(result.current.isSelected("a")).toBe(false);
    expect(result.current.selectedCount).toBe(0);
  });

  it("sets and unsets many ids at once", () => {
    const { result } = renderHook(() => useLibrarySelection());

    act(() => result.current.setMany(["a", "b", "c"], true));
    expect(result.current.selectedCount).toBe(3);

    act(() => result.current.setMany(["a", "b"], false));
    expect(result.current.selectedCount).toBe(1);
    expect(result.current.isSelected("c")).toBe(true);
  });

  it("clears the whole selection", () => {
    const { result } = renderHook(() => useLibrarySelection());

    act(() => result.current.setMany(["a", "b"], true));
    act(() => result.current.clear());
    expect(result.current.selectedCount).toBe(0);
  });

  it("derives the selected failed ids for the page", () => {
    const items = [
      makeTrack("a", RequestStatus.enum.failed),
      makeTrack("b", RequestStatus.enum.complete),
      makeTrack("c", RequestStatus.enum.failed),
    ];
    const { result } = renderHook(() => useLibrarySelection());

    act(() => result.current.setMany(["a", "b"], true));
    expect(result.current.selectors.selectedFailedIds(items)).toEqual(["a"]);
  });

  it("derives only the selected complete ids as upgradable", () => {
    const items = [
      makeTrack("a", RequestStatus.enum.complete),
      makeTrack("b", RequestStatus.enum.failed),
      makeTrack("c", RequestStatus.enum.downloading),
      makeTrack("d", RequestStatus.enum.complete),
    ];
    const { result } = renderHook(() => useLibrarySelection());

    act(() => result.current.setMany(["a", "b", "c"], true));
    expect(result.current.selectors.selectedUpgradableIds(items)).toEqual(["a"]);
  });

  it("ignores complete rows that are not selected", () => {
    const items = [makeTrack("a", RequestStatus.enum.complete), makeTrack("b", RequestStatus.enum.complete)];
    const { result } = renderHook(() => useLibrarySelection());

    expect(result.current.selectors.selectedUpgradableIds(items)).toEqual([]);
  });

  it("reports all and some selected on the page", () => {
    const items = [makeTrack("a", RequestStatus.enum.complete), makeTrack("b", RequestStatus.enum.complete)];
    const { result } = renderHook(() => useLibrarySelection());

    act(() => result.current.toggle("a"));
    expect(result.current.selectors.someSelectedOnPage(items)).toBe(true);
    expect(result.current.selectors.allSelectedOnPage(items)).toBe(false);

    act(() => result.current.toggle("b"));
    expect(result.current.selectors.allSelectedOnPage(items)).toBe(true);
  });
});
