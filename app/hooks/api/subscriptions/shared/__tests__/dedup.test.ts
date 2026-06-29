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
