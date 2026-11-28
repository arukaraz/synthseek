import { describe, expect, it } from "vitest";

import { SETTINGS_SEARCH_ENTRIES } from "@features/settings/components/SettingsSearch/constants";

import { SETUP_ITEM_TARGETS, SETUP_ITEM_TOTAL } from "../constants";

describe("SETUP_ITEM_TARGETS", () => {
  it("has a row for every item the server can report", () => {
    expect(Object.keys(SETUP_ITEM_TARGETS)).toHaveLength(SETUP_ITEM_TOTAL);
  });

  it.each(Object.entries(SETUP_ITEM_TARGETS))("%s links to a card that Settings search also knows", (_item, target) => {
    const [path, anchor] = target.href.split("#");

    const known = SETTINGS_SEARCH_ENTRIES.some((entry) => entry.href === path && entry.anchor === anchor);

    expect(known).toBe(true);
  });
});
