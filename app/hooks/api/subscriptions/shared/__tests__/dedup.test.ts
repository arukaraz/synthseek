import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { SubscriptionEventType, type SubscriptionEvent } from "@api/__generated__/types";
import { isDuplicate } from "../dedup";

function playlistUpdate(
  overrides: Partial<Extract<SubscriptionEvent, { eventType: SubscriptionEventType.PlaylistUpdate }>>
): SubscriptionEvent {
  return {
    eventType: SubscriptionEventType.PlaylistUpdate,
    playlistId: "pl-1",
    status: "in_progress",
    completedTracks: 5,
    totalTracks: 10,
    ...overrides,
  };
}

describe("isDuplicate PlaylistUpdate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not dedupe a populate-complete event against a phase-less tick with identical fields", () => {
    const cache = new Map<string, number>();

    const tick = playlistUpdate({});
    const completePhase = playlistUpdate({ populatePhase: "complete" });

    expect(isDuplicate(tick, cache)).toBe(false);
    vi.advanceTimersByTime(10);
    expect(isDuplicate(completePhase, cache)).toBe(false);
  });

  it("dedupes two identical phase-less download ticks within the window", () => {
    const cache = new Map<string, number>();

    const first = playlistUpdate({});
    const second = playlistUpdate({});

    expect(isDuplicate(first, cache)).toBe(false);
    vi.advanceTimersByTime(10);
    expect(isDuplicate(second, cache)).toBe(true);
  });

  it("keeps each populate phase distinct from a phase-less tick", () => {
    const cache = new Map<string, number>();

    expect(isDuplicate(playlistUpdate({}), cache)).toBe(false);
    vi.advanceTimersByTime(10);
    expect(isDuplicate(playlistUpdate({ populatePhase: "partial" }), cache)).toBe(false);
    vi.advanceTimersByTime(10);
    expect(isDuplicate(playlistUpdate({ populatePhase: "failed" }), cache)).toBe(false);
  });
});

function dropImportUpdate(
  overrides: Partial<Extract<SubscriptionEvent, { eventType: SubscriptionEventType.DropImportUpdate }>>
): SubscriptionEvent {
  return {
    eventType: SubscriptionEventType.DropImportUpdate,
    batchId: "batch-1",
    status: "processing",
    totalFiles: 3,
    importedFiles: 1,
    alreadyInLibraryFiles: 0,
    pendingFiles: 0,
    failedFiles: 0,
    discardedFiles: 0,
    ...overrides,
  };
}

describe("isDuplicate DropImportUpdate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("dedupes two identical batch ticks within the window", () => {
    const cache = new Map<string, number>();

    expect(isDuplicate(dropImportUpdate({}), cache)).toBe(false);
    vi.advanceTimersByTime(10);
    expect(isDuplicate(dropImportUpdate({}), cache)).toBe(true);
  });

  it("keeps events for different files distinct", () => {
    const cache = new Map<string, number>();

    expect(isDuplicate(dropImportUpdate({ file: { id: "f1", name: "a.mp3", status: "imported" } }), cache)).toBe(false);
    vi.advanceTimersByTime(10);
    expect(isDuplicate(dropImportUpdate({ file: { id: "f2", name: "b.mp3", status: "imported" } }), cache)).toBe(false);
  });

  it("keeps a file status change distinct from the previous status", () => {
    const cache = new Map<string, number>();

    expect(isDuplicate(dropImportUpdate({ file: { id: "f1", name: "a.mp3", status: "importing" } }), cache)).toBe(
      false
    );
    vi.advanceTimersByTime(10);
    expect(isDuplicate(dropImportUpdate({ file: { id: "f1", name: "a.mp3", status: "imported" } }), cache)).toBe(false);
  });

  it("keeps ticks that differ only in the already-in-library count distinct", () => {
    const cache = new Map<string, number>();

    expect(isDuplicate(dropImportUpdate({ alreadyInLibraryFiles: 1 }), cache)).toBe(false);
    vi.advanceTimersByTime(10);
    expect(isDuplicate(dropImportUpdate({ alreadyInLibraryFiles: 2 }), cache)).toBe(false);
  });
});

function playbackState(
  overrides: Partial<Extract<SubscriptionEvent, { eventType: SubscriptionEventType.PlaybackState }>>
): SubscriptionEvent {
  return {
    eventType: SubscriptionEventType.PlaybackState,
    userId: "u1",
    deviceId: "d1",
    deviceName: "Web Player (Chrome)",
    playing: false,
    track: {
      id: "t1",
      title: "Song",
      artist: "Air",
      album: "Album",
      durationSeconds: 100,
      format: "flac",
      bitrateKbps: 1035,
      lossless: true,
      artworkUrl: null,
    },
    positionSeconds: 0,
    shuffle: false,
    repeat: "off",
    volume: 0.8,
    muted: false,
    transcoding: false,
    issuedAt: 1_000,
    ...overrides,
  };
}

describe("isDuplicate PlaybackState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-04T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps a start distinct from the stop that shared its millisecond, which is how a device announces loading then playing", () => {
    const cache = new Map<string, number>();

    expect(isDuplicate(playbackState({ playing: false }), cache)).toBe(false);
    expect(isDuplicate(playbackState({ playing: true }), cache)).toBe(false);
  });

  it("keeps a track change distinct within the same millisecond", () => {
    const cache = new Map<string, number>();
    const song = playbackState({});
    const other = playbackState({});
    if (other.eventType === SubscriptionEventType.PlaybackState && other.track !== null) other.track.id = "t2";

    expect(isDuplicate(song, cache)).toBe(false);
    expect(isDuplicate(other, cache)).toBe(false);
  });

  it("still drops the very same announcement repeated", () => {
    const cache = new Map<string, number>();

    expect(isDuplicate(playbackState({}), cache)).toBe(false);
    expect(isDuplicate(playbackState({}), cache)).toBe(true);
  });
});
