"use client";

import { useDockJobs } from "@hooks/api/subscriptions";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { resolveSonnerTheme, resolveToastMobileOffset, resolveToastOffset } from "./helpers";
import type { ToasterProps } from "./types";

export function Toaster({ ...props }: ToasterProps) {
  const { theme } = useTheme();
  const dockVisible = useDockJobs().length > 0;
  return (
    <Sonner
      theme={resolveSonnerTheme(theme)}
      position="bottom-right"
      richColors
      closeButton
      gap={12}
      offset={resolveToastOffset(dockVisible)}
      mobileOffset={resolveToastMobileOffset(dockVisible)}
      {...props}
    />
  );
}
