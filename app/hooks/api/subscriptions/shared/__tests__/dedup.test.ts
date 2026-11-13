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

describe("isDuplicate DropImportUpdate", () => {
  it("lets every update through, since each one carries the rows a later one may return to", () => {
    const cache = new Map<string, number>();
    const event: SubscriptionEvent = {
      eventType: SubscriptionEventType.DropImportUpdate,
      batchId: "batch-1",
      batch: {
        id: "batch-1",
        user_id: "u1",
        status: "processing",
        total_files: 3,
        imported_files: 1,
        already_in_library_files: 0,
        pending_files: 0,
        failed_files: 0,
        discarded_files: 0,
        created_at: new Date(1_000),
        updated_at: new Date(2_000),
      },
    };

    expect(isDuplicate(event, cache)).toBe(false);
    expect(isDuplicate(event, cache)).toBe(false);
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

function releaseProgress(
  percent: number | null,
  state: "queued" | "fetching" = "fetching",
  title: string | null = null,
  etaMinutes: number | null = null
): SubscriptionEvent {
  return {
    eventType: SubscriptionEventType.ReleaseProgress,
    userId: "user-1",
    source: "torrent",
    releaseKey: "album|300",
    release:
      percent === null
        ? null
        : {
            userId: "user-1",
            source: "torrent",
            releaseKey: "album|300",
            title,
            state,
            percent,
            doneBytes: percent,
            totalBytes: 100,
            etaMinutes,
            albumIds: ["album-1"],
            trackRequestIds: ["track-1"],
          },
  };
}

describe("isDuplicate ReleaseProgress", () => {
  it("keeps every step of a release distinct: a new percentage, a state change and its end", () => {
    const cache = new Map<string, number>();

    expect(isDuplicate(releaseProgress(10), cache)).toBe(false);
    expect(isDuplicate(releaseProgress(11), cache)).toBe(false);
    expect(isDuplicate(releaseProgress(11, "queued"), cache)).toBe(false);
    expect(isDuplicate(releaseProgress(11, "queued", "Artist - Album"), cache)).toBe(false);
    expect(isDuplicate(releaseProgress(11, "queued", "Artist - Album", 3), cache)).toBe(false);
    expect(isDuplicate(releaseProgress(null), cache)).toBe(false);
  });

  it("drops the very same step repeated", () => {
    const cache = new Map<string, number>();

    expect(isDuplicate(releaseProgress(10), cache)).toBe(false);
    expect(isDuplicate(releaseProgress(10), cache)).toBe(true);
  });
});

describe("isDuplicate ListeningNowUpdate", () => {
  it("lets every announcement through, since the server's trailing one carries the last change", () => {
    const cache = new Map<string, number>();
    const event: SubscriptionEvent = { eventType: SubscriptionEventType.ListeningNowUpdate, members: [] };

    expect(isDuplicate(event, cache)).toBe(false);
    expect(isDuplicate(event, cache)).toBe(false);
  });
});
