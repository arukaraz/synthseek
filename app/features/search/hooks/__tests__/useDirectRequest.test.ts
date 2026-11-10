import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMusicAlbum, createMusicArtist, createMusicPlaylist, createMusicTrack } from "@test/factories";

import { useDirectRequest } from "../useDirectRequest";

const spies = vi.hoisted(() => ({
  submit: vi.fn(),
  fetchContents: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@hooks/api", () => ({ useContentsFetcher: () => spies.fetchContents }));
vi.mock("../useContentRequestSubmit", () => ({
  useContentRequestSubmit: () => ({ submit: spies.submit, isSubmitting: false }),
}));
vi.mock("sonner", () => ({ toast: { error: spies.toastError } }));

const album = createMusicAlbum({ id: "album-1", name: "Blue Lines" });
const artist = createMusicArtist({ id: "artist-1", name: "Massive Attack" });
const playlist = createMusicPlaylist({ id: "pl-1", name: "Trip-hop" });
const tracks = [createMusicTrack({ id: "t1" }), createMusicTrack({ id: "t2" })];

beforeEach(() => {
  vi.clearAllMocks();
  spies.submit.mockReturnValue("sent");
  spies.fetchContents.mockResolvedValue({ success: true, content: tracks });
});

describe("useDirectRequest", () => {
  it("sends a track at once, with no config so the server applies the preset", async () => {
    const track = createMusicTrack({ id: "single" });
    const { result } = renderHook(() => useDirectRequest());

    await act(() => result.current.request({ item: track, mode: "download" }));

    expect(spies.fetchContents).not.toHaveBeenCalled();
    expect(spies.submit).toHaveBeenCalledWith({ item: track, mode: "download", parentAlbum: undefined, tracks: [] });
    expect(spies.submit.mock.calls[0]?.[0]).not.toHaveProperty("config");
    expect(result.current.pending).toBeNull();
  });

  it("loads an album's tracks and sends them without asking", async () => {
    const { result } = renderHook(() => useDirectRequest());

    await act(() => result.current.request({ item: album, mode: "download" }));

    expect(spies.fetchContents).toHaveBeenCalledWith("album-1", "album");
    expect(spies.submit).toHaveBeenCalledWith(expect.objectContaining({ item: album, tracks }));
    expect(result.current.pending).toBeNull();
  });

  it("asks before sending a playlist, and sends it on confirm", async () => {
    const { result } = renderHook(() => useDirectRequest());

    await act(() => result.current.request({ item: playlist, mode: "download" }));

    expect(spies.submit).not.toHaveBeenCalled();
    expect(result.current.pending).toMatchObject({ name: "Trip-hop", tracks });

    act(() => result.current.confirm());

    expect(spies.submit).toHaveBeenCalledWith(expect.objectContaining({ item: playlist, tracks }));
    expect(result.current.pending).toBeNull();
  });

  it("drops a playlist when the user cancels", async () => {
    const { result } = renderHook(() => useDirectRequest());

    await act(() => result.current.request({ item: playlist, mode: "download" }));
    act(() => result.current.cancel());

    expect(result.current.pending).toBeNull();
    expect(spies.submit).not.toHaveBeenCalled();
  });

  it("asks before sending an artist's top tracks it was handed", async () => {
    const { result } = renderHook(() => useDirectRequest());

    await act(() => result.current.request({ item: artist, mode: "artist-tracks", tracks }));

    expect(spies.fetchContents).not.toHaveBeenCalled();
    expect(result.current.pending?.tracks).toEqual(tracks);
  });

  it("says so and sends nothing when there are no tracks", async () => {
    spies.fetchContents.mockResolvedValue({ success: true, content: [] });
    const { result } = renderHook(() => useDirectRequest());

    await act(() => result.current.request({ item: album, mode: "download" }));

    expect(spies.submit).not.toHaveBeenCalled();
    expect(spies.toastError).toHaveBeenCalledTimes(1);
  });

  it("says so when the tracks cannot be loaded", async () => {
    spies.fetchContents.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useDirectRequest());

    await act(() => result.current.request({ item: album, mode: "download" }));

    expect(spies.submit).not.toHaveBeenCalled();
    expect(spies.toastError).toHaveBeenCalledTimes(1);
  });

  it("ignores a second click while the first is still loading", async () => {
    let release: (value: unknown) => void = () => {};
    spies.fetchContents.mockReturnValue(
      new Promise((resolve) => {
        release = resolve;
      })
    );
    const { result } = renderHook(() => useDirectRequest());

    let first: Promise<void> = Promise.resolve();
    act(() => {
      first = result.current.request({ item: album, mode: "download" });
    });
    await act(() => result.current.request({ item: album, mode: "download" }));
    await act(async () => {
      release({ success: true, content: tracks });
      await first;
    });

    expect(spies.fetchContents).toHaveBeenCalledTimes(1);
    expect(spies.submit).toHaveBeenCalledTimes(1);
  });

  it("still sends another album while the first one is loading", async () => {
    let release: (value: unknown) => void = () => {};
    spies.fetchContents
      .mockReturnValueOnce(
        new Promise((resolve) => {
          release = resolve;
        })
      )
      .mockResolvedValueOnce({ success: true, content: tracks });
    const other = createMusicAlbum({ id: "album-2", name: "Mezzanine" });
    const { result } = renderHook(() => useDirectRequest());

    let first: Promise<void> = Promise.resolve();
    act(() => {
      first = result.current.request({ item: album, mode: "download" });
    });
    await act(() => result.current.request({ item: other, mode: "download" }));
    await act(async () => {
      release({ success: true, content: tracks });
      await first;
    });

    expect(spies.fetchContents).toHaveBeenCalledTimes(2);
    expect(spies.submit).toHaveBeenCalledTimes(2);
  });
});
