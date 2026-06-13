import { TOAST_OFFSET_DEFAULT, TOAST_OFFSET_WITH_DOCK, TOAST_OFFSET_WITH_DOCK_MOBILE } from "./constants";
import type { SonnerTheme, ToasterOffset } from "./types";

export function resolveSonnerTheme(theme: string | undefined): SonnerTheme {
  if (theme === "light") return "light";
  if (theme === "system") return "system";
  return "dark";
}

export function resolveToastOffset(dockVisible: boolean): ToasterOffset {
  return { bottom: dockVisible ? TOAST_OFFSET_WITH_DOCK : TOAST_OFFSET_DEFAULT };
}

export function resolveToastMobileOffset(dockVisible: boolean): ToasterOffset {
  return { bottom: dockVisible ? TOAST_OFFSET_WITH_DOCK_MOBILE : TOAST_OFFSET_DEFAULT };
}
