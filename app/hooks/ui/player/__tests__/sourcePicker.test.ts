import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { playableOnlyFrom, queueFromSource, sourceCountsOf } from "../helpers";
import { settleSourcePick, tracksFromChosenSource, useSourcePickerRequest } from "../sourcePicker";
import type { PlayerSessionState } from "../types";

type Track = PlayerSessionState["queue"][number];

function track(id: string, keys: readonly string[]): Track {
  return {
    id,
    title: `Song ${id}`,
    artist: "Air",
    album: "Moon Safari",
    albumId: "al1",
    durationSeconds: 200,
    format: "flac",
    bitrateKbps: 900,
    lossless: true,
    tone: "primary",
    artworkUrl: null,
    replayGain: { trackGain: null, albumGain: null, trackPeak: null, albumPeak: null },
    sources: keys.map((key) => ({ key, format: "flac", bitrateKbps: 900 })),
  };
}

const ALBUM = [
  track("t1", ["navidrome", "jellyfin"]),
  track("t2", ["local", "navidrome", "jellyfin"]),
  track("t3", ["local", "jellyfin"]),
];

describe("counting where an album's tracks can play from", () => {
  it("counts every copy once per track, in the admin's order even when the first track lacks the local file", () => {
    expect(sourceCountsOf(ALBUM)).toEqual([
      { key: "local", count: 2 },
      { key: "navidrome", count: 2 },
      { key: "jellyfin", count: 3 },
    ]);
  });
});

describe("queueing an album from the chosen source", () => {
  it("puts the chosen source first on every track that has it and keeps the rest in order", () => {
    const queue = queueFromSource(ALBUM, { source: "navidrome", fillFromNext: true });

    expect(queue.map((entry) => entry.sources.map((source) => source.key))).toEqual([
      ["navidrome", "jellyfin"],
      ["navidrome", "local", "jellyfin"],
      ["local", "jellyfin"],
    ]);
  });

  it("drops the tracks the chosen source lacks when the listener asked for that source only", () => {
    const queue = queueFromSource(ALBUM, { source: "navidrome", fillFromNext: false });

    expect(queue.map((entry) => entry.id)).toEqual(["t1", "t2"]);
  });
});

describe("playing only from the sources the listener filtered to", () => {
  it("keeps the chosen sources in the admin's order whatever order they were picked in", () => {
    const queue = playableOnlyFrom(ALBUM, ["jellyfin", "navidrome"]);

    expect(queue.map((entry) => entry.sources.map((source) => source.key))).toEqual([
      ["navidrome", "jellyfin"],
      ["navidrome", "jellyfin"],
      ["jellyfin"],
    ]);
  });

  it("drops a track none of the chosen sources holds", () => {
    const queue = playableOnlyFrom(ALBUM, ["local"]);

    expect(queue.map((entry) => entry.id)).toEqual(["t2", "t3"]);
    expect(queue.every((entry) => entry.sources.length === 1)).toBe(true);
  });

  it("keeps every source when none was chosen", () => {
    expect(playableOnlyFrom(ALBUM, [])).toEqual(ALBUM);
  });
});

describe("asking which source to play from", () => {
  it("plays straight away without asking when every track is in the same single place", async () => {
    const tracks = [track("t1", ["local"]), track("t2", ["local"])];

    await expect(tracksFromChosenSource(tracks)).resolves.toEqual(tracks);
  });

  it("plays straight away when the first source in the admin's order holds every track", async () => {
    const tracks = [track("t1", ["local", "navidrome"]), track("t2", ["local", "jellyfin"])];

    await expect(tracksFromChosenSource(tracks)).resolves.toEqual(tracks);
  });

  it("asks with the counts, and queues from what the listener picked", async () => {
    const { result } = renderHook(() => useSourcePickerRequest());
    let pending: Promise<Track[] | null> = Promise.resolve(null);
    act(() => {
      pending = tracksFromChosenSource(ALBUM);
    });

    expect(result.current).toMatchObject({
      total: 3,
      counts: [{ key: "local" }, { key: "navidrome" }, { key: "jellyfin" }],
    });
    act(() => settleSourcePick({ source: "jellyfin", fillFromNext: true }));

    const queue = await pending;
    expect(queue?.every((entry) => entry.sources[0]?.key === "jellyfin")).toBe(true);
    expect(result.current).toBeNull();
  });

  it("plays nothing when the listener closes the question", async () => {
    const pending = tracksFromChosenSource(ALBUM);

    settleSourcePick(null);

    await expect(pending).resolves.toBeNull();
  });

  it("answers a question only once, so the close that follows a confirm cannot undo it", async () => {
    const pending = tracksFromChosenSource(ALBUM);

    settleSourcePick({ source: "local", fillFromNext: false });
    settleSourcePick(null);

    await expect(pending).resolves.toHaveLength(2);
  });

  it("lets a newer question replace one still open, closing the older one", async () => {
    const older = tracksFromChosenSource(ALBUM);
    const newer = tracksFromChosenSource(ALBUM);

    settleSourcePick({ source: "navidrome", fillFromNext: true });

    await expect(older).resolves.toBeNull();
    await expect(newer).resolves.toHaveLength(3);
  });
});
