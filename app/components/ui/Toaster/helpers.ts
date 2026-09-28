import type { PlayerDockState } from "@hooks/ui/player";

import {
  TOAST_OFFSET_ABOVE_PLAYER,
  TOAST_OFFSET_ABOVE_PLAYER_CHAIN,
  TOAST_OFFSET_ABOVE_PLAYER_CHAIN_MOBILE,
  TOAST_OFFSET_ABOVE_PLAYER_MOBILE,
  TOAST_OFFSET_DEFAULT,
  TOAST_OFFSET_WITH_DOCK,
  TOAST_OFFSET_WITH_DOCK_MOBILE,
} from "./constants";
import type { SonnerTheme, ToasterOffset } from "./types";

export function resolveSonnerTheme(theme: string | undefined): SonnerTheme {
  if (theme === "light") return "light";
  if (theme === "system") return "system";
  return "dark";
}

export function resolveToastOffset(dockVisible: boolean, playerDock: PlayerDockState): ToasterOffset {
  if (playerDock === "chain") return { bottom: TOAST_OFFSET_ABOVE_PLAYER_CHAIN };
  if (playerDock === "bar") return { bottom: TOAST_OFFSET_ABOVE_PLAYER };
  return { bottom: dockVisible ? TOAST_OFFSET_WITH_DOCK : TOAST_OFFSET_DEFAULT };
}

export function resolveToastMobileOffset(dockVisible: boolean, playerDock: PlayerDockState): ToasterOffset {
  if (playerDock === "chain") return { bottom: TOAST_OFFSET_ABOVE_PLAYER_CHAIN_MOBILE };
  if (playerDock === "bar") return { bottom: TOAST_OFFSET_ABOVE_PLAYER_MOBILE };
  return { bottom: dockVisible ? TOAST_OFFSET_WITH_DOCK_MOBILE : TOAST_OFFSET_DEFAULT };
}
