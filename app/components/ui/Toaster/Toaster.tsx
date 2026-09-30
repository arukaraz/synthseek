"use client";

import { useDockJobs } from "@hooks/api/subscriptions";
import { usePlayerBottomDock } from "@hooks/ui/player";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { TOAST_OFFSET_AT_LAYOUT_BREAKPOINT } from "./constants";
import { resolveSonnerTheme, resolveToastMobileOffset, resolveToastOffset } from "./helpers";
import { TOAST_ICONS } from "./icons";
import { TOAST_CLASS_NAMES, toastOffsetVars } from "./styles";
import type { ToasterProps } from "./types";

export function Toaster({ ...props }: ToasterProps) {
  const { theme } = useTheme();
  const dockVisible = useDockJobs().length > 0;
  const playerDock = usePlayerBottomDock();
  return (
    <Sonner
      theme={resolveSonnerTheme(theme)}
      position="bottom-right"
      closeButton
      gap={12}
      icons={TOAST_ICONS}
      toastOptions={{ classNames: TOAST_CLASS_NAMES }}
      style={toastOffsetVars(
        resolveToastMobileOffset(dockVisible, playerDock),
        resolveToastOffset(dockVisible, playerDock)
      )}
      offset={TOAST_OFFSET_AT_LAYOUT_BREAKPOINT}
      mobileOffset={TOAST_OFFSET_AT_LAYOUT_BREAKPOINT}
      duration={2000}
      {...props}
    />
  );
}
