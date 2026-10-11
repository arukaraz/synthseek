import { describe, expect, it } from "vitest";

import { SOURCE_PRIORITY_ORDER, SOURCE_ROW_LABELS } from "../constants";

describe("SOURCE_PRIORITY_ORDER", () => {
  it("lists every download source exactly once, so a new source cannot go unoffered", () => {
    expect([...SOURCE_PRIORITY_ORDER].sort()).toEqual(Object.keys(SOURCE_ROW_LABELS).sort());
  });
});
