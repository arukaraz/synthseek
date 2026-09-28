import { describe, expect, it } from "vitest";

import {
  TOAST_OFFSET_ABOVE_PLAYER,
  TOAST_OFFSET_ABOVE_PLAYER_CHAIN,
  TOAST_OFFSET_ABOVE_PLAYER_CHAIN_MOBILE,
  TOAST_OFFSET_ABOVE_PLAYER_MOBILE,
  TOAST_OFFSET_DEFAULT,
  TOAST_OFFSET_WITH_DOCK,
  TOAST_OFFSET_WITH_DOCK_MOBILE,
} from "../constants";
import { resolveToastMobileOffset, resolveToastOffset } from "../helpers";

describe("resolveToastOffset", () => {
  it("keeps the toasts where they were when no player bar sits at the bottom", () => {
    expect(resolveToastOffset(false, "hidden")).toEqual({ bottom: TOAST_OFFSET_DEFAULT });
    expect(resolveToastOffset(true, "hidden")).toEqual({ bottom: TOAST_OFFSET_WITH_DOCK });
  });

  it("lifts the toasts above the player bar, and above the chain when it is open", () => {
    expect(resolveToastOffset(false, "bar")).toEqual({ bottom: TOAST_OFFSET_ABOVE_PLAYER });
    expect(resolveToastOffset(false, "chain")).toEqual({ bottom: TOAST_OFFSET_ABOVE_PLAYER_CHAIN });
  });

  it("clears the player bar even while the progress dock is showing", () => {
    expect(resolveToastOffset(true, "bar")).toEqual({ bottom: TOAST_OFFSET_ABOVE_PLAYER });
  });
});

describe("resolveToastMobileOffset", () => {
  it("keeps the phone offsets when no player bar sits at the bottom", () => {
    expect(resolveToastMobileOffset(false, "hidden")).toEqual({ bottom: TOAST_OFFSET_DEFAULT });
    expect(resolveToastMobileOffset(true, "hidden")).toEqual({ bottom: TOAST_OFFSET_WITH_DOCK_MOBILE });
  });

  it("lifts the toasts above the bottom navigation and the player bar", () => {
    expect(resolveToastMobileOffset(false, "bar")).toEqual({ bottom: TOAST_OFFSET_ABOVE_PLAYER_MOBILE });
    expect(resolveToastMobileOffset(true, "chain")).toEqual({ bottom: TOAST_OFFSET_ABOVE_PLAYER_CHAIN_MOBILE });
  });
});
