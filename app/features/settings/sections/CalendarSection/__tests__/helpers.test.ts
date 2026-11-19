import { describe, expect, it } from "vitest";

import type { FollowRelease } from "@hooks/api/queries/artist-follow/types";

import {
  addDays,
  buildMonthGrid,
  firstWeekday,
  groupByDay,
  moveGridFocus,
  parseMonthParam,
  shiftMonth,
} from "../helpers";

const MONDAY = 1;
const SUNDAY = 7;

function release(overrides: Partial<FollowRelease> = {}): FollowRelease {
  return {
    releaseId: "r1",
    catalogAlbumId: "al1",
    title: "Title",
    artistName: "Artist",
    creditedArtist: null,
    catalogArtistId: "ar1",
    image: null,
    releaseDate: "2026-11-18",
    type: "album",
    explicit: false,
    autoRequest: false,
    state: "announced",
    ...overrides,
  };
}

describe("buildMonthGrid", () => {
  it("fills whole weeks starting on the locale's first weekday", () => {
    const monday = buildMonthGrid({ ref: { year: 2026, month: 11 }, firstDay: MONDAY, releases: [], today: null });
    const sunday = buildMonthGrid({ ref: { year: 2026, month: 11 }, firstDay: SUNDAY, releases: [], today: null });

    expect(monday[0]?.[0]?.iso).toBe("2026-10-26");
    expect(monday).toHaveLength(6);
    expect(sunday[0]?.[0]?.iso).toBe("2026-11-01");
    expect(sunday).toHaveLength(5);
    expect(monday.every((week) => week.length === 7)).toBe(true);
  });

  it("grows to six rows for a month that straddles six weeks", () => {
    const grid = buildMonthGrid({ ref: { year: 2026, month: 8 }, firstDay: MONDAY, releases: [], today: null });
    expect(grid).toHaveLength(6);
  });

  it("marks only the server's today and keeps spill-over days empty", () => {
    const grid = buildMonthGrid({
      ref: { year: 2026, month: 11 },
      firstDay: MONDAY,
      releases: [release({ releaseDate: "2026-10-30" }), release({ releaseId: "r2", releaseDate: "2026-11-18" })],
      today: "2026-11-18",
    });
    const days = grid.flat();

    expect(days.filter((day) => day.isToday).map((day) => day.iso)).toEqual(["2026-11-18"]);
    expect(days.find((day) => day.iso === "2026-10-30")?.releases).toEqual([]);
    expect(days.find((day) => day.iso === "2026-11-18")?.releases).toHaveLength(1);
  });

  it("orders a day's releases albums first, then EPs and singles, then by artist", () => {
    const grid = buildMonthGrid({
      ref: { year: 2026, month: 11 },
      firstDay: MONDAY,
      today: null,
      releases: [
        release({ releaseId: "s", type: "single", artistName: "Aaa" }),
        release({ releaseId: "b", type: "album", artistName: "Bbb" }),
        release({ releaseId: "a", type: "album", artistName: "Aaa" }),
        release({ releaseId: "e", type: "ep", artistName: "Aaa" }),
      ],
    });
    const day = grid.flat().find((entry) => entry.iso === "2026-11-18");

    expect(day?.releases.map((entry) => entry.releaseId)).toEqual(["a", "b", "e", "s"]);
  });
});

describe("firstWeekday", () => {
  it("starts the week on Monday in Spanish and German, Sunday in English", () => {
    expect(firstWeekday("es")).toBe(MONDAY);
    expect(firstWeekday("de")).toBe(MONDAY);
    expect(firstWeekday("en")).toBe(SUNDAY);
  });
});

describe("month arithmetic", () => {
  it("rolls the year over in both directions", () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
  });

  it("refuses a malformed month parameter", () => {
    expect(parseMonthParam("2026-13")).toBeNull();
    expect(parseMonthParam("2026")).toBeNull();
    expect(parseMonthParam("2026-11-01")).toBeNull();
    expect(parseMonthParam("2026-11")).toEqual({ year: 2026, month: 11 });
  });

  it("adds days across a month end", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
  });
});

describe("moveGridFocus", () => {
  it("moves by day, week and month, clamping the day on a shorter month", () => {
    expect(moveGridFocus("2026-11-18", "ArrowRight", MONDAY)).toBe("2026-11-19");
    expect(moveGridFocus("2026-11-18", "ArrowDown", MONDAY)).toBe("2026-11-25");
    expect(moveGridFocus("2026-01-31", "PageDown", MONDAY)).toBe("2026-02-28");
  });

  it("jumps to the start and end of the week the grid draws", () => {
    expect(moveGridFocus("2026-11-18", "Home", MONDAY)).toBe("2026-11-16");
    expect(moveGridFocus("2026-11-18", "End", MONDAY)).toBe("2026-11-22");
    expect(moveGridFocus("2026-11-18", "Home", SUNDAY)).toBe("2026-11-15");
  });
});

describe("groupByDay", () => {
  it("groups by calendar day in ascending order", () => {
    const groups = groupByDay([
      release({ releaseId: "late", releaseDate: "2026-11-20" }),
      release({ releaseId: "early", releaseDate: "2026-11-02" }),
      release({ releaseId: "same", releaseDate: "2026-11-20", artistName: "Zed" }),
    ]);

    expect(groups.map((group) => group.iso)).toEqual(["2026-11-02", "2026-11-20"]);
    expect(groups[1]?.releases).toHaveLength(2);
  });
});
