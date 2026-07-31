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
});
