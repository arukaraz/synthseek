import { describe, it, expect } from "vitest";

import {
  actionsCell,
  bulkBar,
  bulkCount,
  bulkSpacer,
  importEmpty,
  importList,
  importRow,
  joinedDate,
  pill,
  requestCount,
  toolbarActions,
  userAvatar,
  userCell,
  userEmail,
  userName,
} from "../styles";

describe("MembersSection styles", () => {
  it("returns base class strings for static variants", () => {
    expect(toolbarActions()).toContain("flex");
    expect(bulkBar()).toContain("rounded-lg");
    expect(bulkCount()).toContain("text-sm");
    expect(bulkSpacer()).toContain("flex-1");
    expect(userCell()).toContain("items-center");
    expect(userAvatar()).toContain("rounded-full");
    expect(userName()).toContain("truncate");
    expect(userEmail()).toContain("truncate");
    expect(requestCount()).toContain("tabular-nums");
    expect(joinedDate()).toContain("text-xs");
    expect(actionsCell()).toContain("justify-end");
    expect(importList()).toContain("overflow-y-auto");
    expect(importEmpty()).toContain("text-center");
  });

  it("maps the pill tone variants", () => {
    expect(pill({ tone: "plex" })).toContain("text-amber-300");
    expect(pill({ tone: "local" })).toContain("text-fg/60");
  });

  it("keeps the pill on a single line", () => {
    expect(pill({ tone: "plex" })).toContain("whitespace-nowrap");
    expect(pill({ tone: "plex" })).toContain("shrink-0");
  });

  it("maps the importRow disabled variants", () => {
    expect(importRow({ disabled: true })).toContain("opacity-50");
    expect(importRow({ disabled: false })).toContain("cursor-pointer");
  });
});
