"use client";

import { useDockJobs } from "@hooks/api/subscriptions";
import { usePlayerBottomDock } from "@hooks/ui/player";
import { useAccessibility } from "@modules/providers/AccessibilityProvider";
import { useThemeContext } from "@theme/ThemeProvider";
import { useEffect } from "react";
import { Toaster as Sonner } from "sonner";
import { TOAST_OFFSET_AT_LAYOUT_BREAKPOINT } from "./constants";
import { resolveToastDuration, resolveToastMobileOffset, resolveToastOffset } from "./helpers";
import { TOAST_ICONS } from "./icons";
import { installToastPolicy, setToastPolicy } from "./policy";
import { TOAST_CLASS_NAMES, toastOffsetVars } from "./styles";
import type { ToasterProps } from "./types";

export function Toaster({ ...props }: ToasterProps) {
  const { scheme } = useThemeContext();
  const dockVisible = useDockJobs().length > 0;
  const playerDock = usePlayerBottomDock();
  const { toastDuration, mode } = useAccessibility();
  useEffect(() => {
    installToastPolicy();
    setToastPolicy({ choice: toastDuration, mode });
  }, [toastDuration, mode]);
  return (
    <Sonner
      theme={scheme}
      position="bottom-right"
      className="player-metrics"
      closeButton
      gap={12}
      icons={TOAST_ICONS}
      toastOptions={{ classNames: TOAST_CLASS_NAMES }}
      style={toastOffsetVars(resolveToastMobileOffset(dockVisible), resolveToastOffset(dockVisible, playerDock))}
      offset={TOAST_OFFSET_AT_LAYOUT_BREAKPOINT}
      mobileOffset={TOAST_OFFSET_AT_LAYOUT_BREAKPOINT}
      duration={resolveToastDuration(toastDuration, mode)}
      {...props}
    />
  );
}
