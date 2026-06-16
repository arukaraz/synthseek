"use client";

import { useDockJobs } from "@hooks/api/subscriptions";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { resolveSonnerTheme, resolveToastMobileOffset, resolveToastOffset } from "./helpers";
import { TOAST_ICONS } from "./icons";
import { TOAST_CLASS_NAMES } from "./styles";
import type { ToasterProps } from "./types";

export function Toaster({ ...props }: ToasterProps) {
  const { theme } = useTheme();
  const dockVisible = useDockJobs().length > 0;
  return (
    <Sonner
      theme={resolveSonnerTheme(theme)}
      position="bottom-right"
      closeButton
      gap={12}
      icons={TOAST_ICONS}
      toastOptions={{ classNames: TOAST_CLASS_NAMES }}
      offset={resolveToastOffset(dockVisible)}
      mobileOffset={resolveToastMobileOffset(dockVisible)}
      duration={2000}
      {...props}
    />
  );
}
