import { describe, expect, it } from "vitest";

import type { PlayerDockState } from "@hooks/ui/player";

import {
  TOAST_OFFSET_ABOVE_PLAYER,
  TOAST_OFFSET_ABOVE_PLAYER_CHAIN,
  TOAST_OFFSET_ABOVE_PLAYER_CHAIN_MOBILE,
  TOAST_OFFSET_ABOVE_PLAYER_MOBILE,
  TOAST_OFFSET_DEFAULT,
  TOAST_OFFSET_WITH_DOCK,
} from "../constants";
import { resolveToastMobileOffset, resolveToastOffset } from "../helpers";

const DOCK_STATES = [false, true];
const PLAYER_STATES: PlayerDockState[] = ["hidden", "bar", "chain"];

function everyState(): Array<[boolean, PlayerDockState]> {
  return DOCK_STATES.flatMap((dock) => PLAYER_STATES.map((player): [boolean, PlayerDockState] => [dock, player]));
}

describe("resolveToastOffset", () => {
  it("keeps the toasts where they were when no player bar sits at the bottom", () => {
    expect(resolveToastOffset(false, "hidden")).toBe(TOAST_OFFSET_DEFAULT);
    expect(resolveToastOffset(true, "hidden")).toBe(TOAST_OFFSET_WITH_DOCK);
  });

  it("lifts the toasts above the player bar, and above the chain when it is open", () => {
    expect(resolveToastOffset(false, "bar")).toBe(TOAST_OFFSET_ABOVE_PLAYER);
    expect(resolveToastOffset(false, "chain")).toBe(TOAST_OFFSET_ABOVE_PLAYER_CHAIN);
  });

  it("clears the player bar even while the progress dock is showing", () => {
    expect(resolveToastOffset(true, "bar")).toBe(TOAST_OFFSET_ABOVE_PLAYER);
  });

  it("reserves no room for the bottom navigation, which is hidden at this width", () => {
    for (const [dock, player] of everyState()) {
      expect(resolveToastOffset(dock, player)).not.toContain("--height-bottom-nav");
    }
  });
});

describe("resolveToastMobileOffset", () => {
  it("clears the bottom navigation in every state, since a phone always shows it", () => {
    for (const [dock, player] of everyState()) {
      expect(resolveToastMobileOffset(dock, player)).toContain("var(--height-bottom-nav)");
    }
  });

  it("lifts the toasts above the bottom navigation and the player bar", () => {
    expect(resolveToastMobileOffset(false, "bar")).toBe(TOAST_OFFSET_ABOVE_PLAYER_MOBILE);
    expect(resolveToastMobileOffset(true, "chain")).toBe(TOAST_OFFSET_ABOVE_PLAYER_CHAIN_MOBILE);
  });
});
