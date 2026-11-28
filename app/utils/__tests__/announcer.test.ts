import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ANNOUNCEMENT_CLEAR_MS,
  announce,
  readAnnouncement,
  resetAnnouncements,
  subscribeAnnouncement,
} from "../announcer";

beforeEach(() => {
  vi.useFakeTimers();
  resetAnnouncements();
});

afterEach(() => {
  resetAnnouncements();
  vi.useRealTimers();
});

describe("announcer", () => {
  it("holds the last message with a new id every time, even for the same words", () => {
    announce("Moved to position 2 of 5");
    const first = readAnnouncement();

    announce("Moved to position 2 of 5");
    const second = readAnnouncement();

    expect(second.text).toBe(first.text);
    expect(second.id).toBeGreaterThan(first.id);
  });

  it("tells every subscriber, and stops telling one that left", () => {
    const heard = vi.fn();
    const leave = subscribeAnnouncement(heard);

    announce("One");
    leave();
    announce("Two");

    expect(heard).toHaveBeenCalledTimes(1);
  });

  it("clears itself once the words have had time to be heard", () => {
    announce("Now playing");

    vi.advanceTimersByTime(ANNOUNCEMENT_CLEAR_MS);

    expect(readAnnouncement().text).toBe("");
  });

  it("clears at once when asked to say nothing", () => {
    announce("Now playing");

    announce("");

    expect(readAnnouncement().text).toBe("");
  });

  it("keeps a newer message alive past the clear time of an older one", () => {
    announce("Older");
    vi.advanceTimersByTime(ANNOUNCEMENT_CLEAR_MS - 1000);
    announce("Newer");

    vi.advanceTimersByTime(2000);

    expect(readAnnouncement().text).toBe("Newer");
  });
});
