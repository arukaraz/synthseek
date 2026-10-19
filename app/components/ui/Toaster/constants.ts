import type { ToasterOffset } from "./types";

export const TOAST_ACTION_DURATION_MS = 8000;

export const TOAST_DETAIL_DURATION_MS = 8000;

export const TOAST_OFFSET_DEFAULT = "1.5rem";

export const TOAST_OFFSET_DEFAULT_MOBILE = "calc(var(--height-bottom-nav) + 0.75rem)";

export const TOAST_OFFSET_WITH_DOCK = "7rem";

export const TOAST_OFFSET_WITH_DOCK_MOBILE = "calc(var(--height-bottom-nav) + 6.5rem)";

export const TOAST_OFFSET_ABOVE_PLAYER = "calc(var(--player-bar-height) + var(--player-dock-gap) + 1rem)";

export const TOAST_OFFSET_ABOVE_PLAYER_CHAIN =
  "calc(var(--player-bar-height) + var(--height-player-chain) + var(--player-dock-gap) + 1rem)";

export const TOAST_OFFSET_ABOVE_PLAYER_MOBILE = "calc(var(--height-bottom-nav) + var(--height-player-bar) + 0.75rem)";

export const TOAST_OFFSET_ABOVE_PLAYER_CHAIN_MOBILE =
  "calc(var(--height-bottom-nav) + var(--height-player-bar) + var(--height-player-chain) + 0.75rem)";

export const TOAST_OFFSET_AT_LAYOUT_BREAKPOINT: ToasterOffset = { bottom: "var(--toast-offset-bottom)" };
