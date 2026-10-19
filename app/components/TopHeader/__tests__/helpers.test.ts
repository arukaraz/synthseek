import { Settings } from "lucide-react";
import { describe, expect, it } from "vitest";

import { createTrack } from "@features/discover/components/TrendingHero/__tests__/fixtures";

import { omniOptions, optionId, optionText, resultOption, scopeTypes } from "../helpers";
import type { OmniOption } from "../types";

const GOTO: OmniOption = {
  kind: "goto",
  key: "goto:settings",
  href: "/settings/overview",
  icon: Settings,
  title: "Settings",
  subtitle: "Preferences",
};

function trackItem() {
  return createTrack({ id: "t1", title: "Karma Police", artists: [{ id: "a1", name: "Radiohead" }] });
}

describe("scopeTypes", () => {
  it("searches every content type for all, and one type otherwise", () => {
    expect(scopeTypes("all")).toEqual(expect.arrayContaining(["track", "album", "artist", "playlist"]));
    expect(scopeTypes("album")).toEqual(["album"]);
  });
});

describe("omniOptions", () => {
  it("shows the recent searches and then the go-to rows while the query is empty", () => {
    const options = omniOptions("  ", ["daft punk"], [], [GOTO]);

    expect(options.map((option) => option.kind)).toEqual(["recent", "goto"]);
  });

  it("shows the results, the see-all row for the trimmed query, then the go-to rows", () => {
    const result = resultOption(trackItem());
    const options = omniOptions(" karma ", ["daft punk"], [result], [GOTO]);

    expect(options.map((option) => option.kind)).toEqual(["result", "seeAll", "goto"]);
    expect(options[1]).toMatchObject({ kind: "seeAll", query: "karma" });
  });
});

describe("resultOption", () => {
  it("names the result, describes it and carries the original item", () => {
    const item = trackItem();
    const option = resultOption(item);

    expect(option).toMatchObject({ kind: "result", key: "track:t1", title: "Karma Police", type: "track" });
    expect(optionText(option).subtitle).toContain("Radiohead");
  });
});

describe("optionText", () => {
  it("words the recent, see-all and go-to rows", () => {
    expect(optionText({ kind: "recent", key: "r", query: "nin" })).toEqual({ title: "nin", subtitle: "" });
    expect(optionText({ kind: "seeAll", key: "s", query: "nin" }).title).toBe("See all results for “nin”");
    expect(optionText(GOTO)).toEqual({ title: "Settings", subtitle: "Preferences" });
  });
});

describe("optionId", () => {
  it("derives a stable id inside the listbox", () => {
    expect(optionId(3)).toBe("omni-search-options-3");
  });
});
