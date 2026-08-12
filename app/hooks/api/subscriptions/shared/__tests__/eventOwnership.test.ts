import { describe, it, expect } from "vitest";

import { isForeignJobEvent } from "../eventOwnership";

describe("isForeignJobEvent", () => {
  it("treats a job started by the viewer as their own", () => {
    expect(isForeignJobEvent("u_self", "u_self")).toBe(false);
  });

  it("treats a job started by anybody else as foreign", () => {
    expect(isForeignJobEvent("u_other", "u_self")).toBe(true);
  });

  it("does not call a job foreign while the viewer is unknown", () => {
    expect(isForeignJobEvent("u_other", null)).toBe(false);
  });

  it("does not call a job foreign when the event names no owner", () => {
    expect(isForeignJobEvent("", "u_self")).toBe(false);
  });
});
