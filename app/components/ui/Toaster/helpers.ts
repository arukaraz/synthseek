import type { PlayerDockState } from "@hooks/ui/player";
import type { A11yToastDuration } from "@modules/accessibility";

import {
  TOAST_DEFAULT_DURATION_MS,
  TOAST_DURATION_MS_BY_SECONDS,
  TOAST_MODE_DEFAULT_DURATION_MS,
  TOAST_OFFSET_ABOVE_PLAYER,
  TOAST_OFFSET_ABOVE_PLAYER_CHAIN,
  TOAST_OFFSET_DEFAULT,
  TOAST_OFFSET_DEFAULT_MOBILE,
  TOAST_OFFSET_WITH_DOCK,
  TOAST_OFFSET_WITH_DOCK_MOBILE,
} from "./constants";
import type { ToastDurationInput } from "./types";

export function resolveToastDuration(choice: A11yToastDuration, accessibilityMode: boolean): number {
  if (choice === "sticky") return Number.POSITIVE_INFINITY;
  if (choice === "default") return accessibilityMode ? TOAST_MODE_DEFAULT_DURATION_MS : TOAST_DEFAULT_DURATION_MS;
  return TOAST_DURATION_MS_BY_SECONDS[choice];
}

export function resolveToastCallDuration({
  choice,
  mode,
  kind,
  hasAction,
  explicit,
}: ToastDurationInput): number | undefined {
  if (choice !== "default") return resolveToastDuration(choice, mode);
  if (!mode) return explicit;
  if (kind === "error" || hasAction) return Number.POSITIVE_INFINITY;
  return explicit === undefined ? undefined : Math.max(explicit, TOAST_MODE_DEFAULT_DURATION_MS);
}

export function resolveToastOffset(dockVisible: boolean, playerDock: PlayerDockState): string {
  if (playerDock === "chain") return TOAST_OFFSET_ABOVE_PLAYER_CHAIN;
  if (playerDock === "bar") return TOAST_OFFSET_ABOVE_PLAYER;
  return dockVisible ? TOAST_OFFSET_WITH_DOCK : TOAST_OFFSET_DEFAULT;
}

export function resolveToastMobileOffset(dockVisible: boolean): string {
  return dockVisible ? TOAST_OFFSET_WITH_DOCK_MOBILE : TOAST_OFFSET_DEFAULT_MOBILE;
}
