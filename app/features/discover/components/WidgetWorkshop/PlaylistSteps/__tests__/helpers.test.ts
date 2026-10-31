import { describe, expect, it } from "vitest";

import i18n from "@locale";

import type { PlaylistSetQuery } from "@hooks/api/queries/widgets/types";

import { DEFAULT_PLAYLIST_SET } from "../../../../constants";
import {
  clockFrom,
  clockValue,
  defaultParam,
  nextRunText,
  paramText,
  windowChoiceOf,
  windowFrom,
  withDayToggled,
  withNewSlot,
  withOrigin,
  withSlotCount,
  withSlotLabels,
} from "../helpers";
import type { SetOriginGrammar } from "../types";

const grammar: SetOriginGrammar = {
  origins: [
    { key: "onRepeat", param: "none" },
    { key: "rediscover", param: "none" },
    { key: "forgotten", param: "none" },
    { key: "deepCuts", param: "none" },
    { key: "rewind", param: "none" },
    { key: "favorites", param: "none" },
    { key: "genre", param: "genre" },
    { key: "mood", param: "mood" },
  ],
};

function setOf(count: number): PlaylistSetQuery {
  return { ...DEFAULT_PLAYLIST_SET, slots: DEFAULT_PLAYLIST_SET.slots.slice(0, count) };
}

describe("slot labels", () => {
  it("relabels the default set through the active language", async () => {
    await i18n.changeLanguage("es");
    const labels = withSlotLabels(setOf(5), grammar).slots.map((slot) => slot.label);
    const expected = [
      i18n.t("widgets:set.origins.onRepeat"),
      i18n.t("widgets:set.origins.rediscover"),
      i18n.t("widgets:set.top.genre", { rank: 1 }),
      i18n.t("widgets:set.top.genre", { rank: 2 }),
      i18n.t("widgets:set.moods.calm"),
    ];
    await i18n.changeLanguage("en");
    expect(labels).toEqual(expected);
    expect(labels[0]).not.toBe(DEFAULT_PLAYLIST_SET.slots[0]?.label);
  });

  it("keeps the labels until the grammar arrives", () => {
    expect(withSlotLabels(DEFAULT_PLAYLIST_SET, undefined)).toBe(DEFAULT_PLAYLIST_SET);
  });

  it("shows a mood or scene it does not know as it came", () => {
    expect(paramText("mood", "unheard")).toBe("unheard");
    expect(paramText("scene", "unheard")).toBe("unheard");
  });
});

describe("slots", () => {
  it("adds a list with a source not used yet and an id no other list holds", () => {
    const next = withNewSlot(setOf(2), grammar);
    const added = next.slots.at(-1);
    expect(added?.origin).toBe("forgotten");
    expect(new Set(next.slots.map((slot) => slot.id)).size).toBe(3);
  });

  it("follows the number typed in Show in both directions", () => {
    expect(withSlotCount(setOf(2), grammar, 4).slots).toHaveLength(4);
    expect(withSlotCount(setOf(6), grammar, 1).slots).toHaveLength(1);
  });

  it("gives a new source the value it needs", () => {
    const [slot] = setOf(1).slots;
    if (!slot) throw new Error("no slot");
    expect(withOrigin(slot, grammar, "genre").param).toBe("top:1");
    expect(withOrigin(slot, grammar, "rewind").param).toBeNull();
    expect(defaultParam("mood")).toBe("calm");
  });
});

describe("refresh controls", () => {
  it("keeps one day chosen, since a weekly refresh needs a day", () => {
    expect(withDayToggled([0], 0)).toEqual([0]);
    expect(withDayToggled([0, 4], 0)).toEqual([4]);
    expect(withDayToggled([4], 0)).toEqual([0, 4]);
  });

  it("reads and writes the clock", () => {
    const { refresh } = DEFAULT_PLAYLIST_SET;
    expect(clockValue({ ...refresh, hour: 7, minute: 5 })).toBe("07:05");
    expect(clockFrom("18:30")).toEqual({ hour: 18, minute: 30 });
    expect(clockFrom("")).toBeNull();
  });

  it("says so when the list only refreshes on request", () => {
    expect(nextRunText(null)).toBe("Only when you ask");
    expect(nextRunText("2026-11-02T13:00:00.000Z")).toContain("Nov");
  });
});

describe("repeat window", () => {
  it("maps the three choices", () => {
    expect(windowChoiceOf("auto")).toBe("auto");
    expect(windowChoiceOf(45)).toBe("custom");
    expect(windowFrom("custom")).toBe(30);
    expect(windowFrom("off")).toBe("off");
  });
});
