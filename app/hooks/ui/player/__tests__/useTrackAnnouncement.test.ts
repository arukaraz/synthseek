import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TRACK_ANNOUNCE_DELAY_MS } from "../constants";
import { readAnnouncement, resetAnnouncements } from "@utils/announcer";
import type { TrackAnnouncementSubject } from "../types";
import { useTrackAnnouncement } from "../useTrackAnnouncement";

function subject(overrides: Partial<TrackAnnouncementSubject> = {}): TrackAnnouncementSubject {
  return { id: "t1", title: "Aerodynamic", artist: "Daft Punk", playing: true, ...overrides };
}

function settle(): void {
  act(() => {
    vi.advanceTimersByTime(TRACK_ANNOUNCE_DELAY_MS + 1);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  resetAnnouncements();
});

afterEach(() => {
  vi.useRealTimers();
  resetAnnouncements();
  document.body.innerHTML = "";
});

describe("announcing a track change", () => {
  it("says the title and artist once when the track changes", () => {
    const { rerender } = renderHook((props) => useTrackAnnouncement(props), { initialProps: subject() });
    settle();
    expect(readAnnouncement().text).toBe("");

    rerender(subject({ id: "t2", title: "Digital Love", artist: "Daft Punk" }));
    settle();

    expect(readAnnouncement().text).toBe("Now playing Digital Love by Daft Punk");
  });

  it("does not repeat itself while the same track keeps playing", () => {
    const { rerender } = renderHook((props) => useTrackAnnouncement(props), { initialProps: subject() });
    rerender(subject({ id: "t2", title: "Digital Love" }));
    settle();
    const first = readAnnouncement().id;

    rerender(subject({ id: "t2", title: "Digital Love", playing: false }));
    rerender(subject({ id: "t2", title: "Digital Love", playing: true }));
    settle();

    expect(readAnnouncement().id).toBe(first);
  });

  it("stays silent for a track that only loaded and is not playing", () => {
    const { rerender } = renderHook((props) => useTrackAnnouncement(props), {
      initialProps: subject({ id: "", title: "", artist: "", playing: false }),
    });

    rerender(subject({ playing: false }));
    settle();

    expect(readAnnouncement().text).toBe("");
  });

  it("announces the first track once it is playing", () => {
    const { rerender } = renderHook((props) => useTrackAnnouncement(props), {
      initialProps: subject({ id: "", title: "", artist: "", playing: false }),
    });

    rerender(subject({ playing: true }));
    settle();

    expect(readAnnouncement().text).toBe("Now playing Aerodynamic by Daft Punk");
  });

  it("says only the last track when several change at once", () => {
    const { rerender } = renderHook((props) => useTrackAnnouncement(props), { initialProps: subject() });

    rerender(subject({ id: "t2", title: "Digital Love" }));
    act(() => {
      vi.advanceTimersByTime(TRACK_ANNOUNCE_DELAY_MS / 2);
    });
    rerender(subject({ id: "t3", title: "Veridis Quo" }));
    settle();

    expect(readAnnouncement().text).toBe("Now playing Veridis Quo by Daft Punk");
  });

  it("stays silent when the focused control already carries the title", () => {
    const row = document.createElement("button");
    row.setAttribute("aria-label", "Play Digital Love by Daft Punk");
    document.body.append(row);
    row.focus();
    const { rerender } = renderHook((props) => useTrackAnnouncement(props), { initialProps: subject() });

    rerender(subject({ id: "t2", title: "Digital Love" }));
    settle();

    expect(readAnnouncement().text).toBe("");
  });
});
