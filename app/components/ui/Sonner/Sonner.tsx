"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import type { ToasterProps } from "./types";

export function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme();
  return <Sonner theme={theme as ToasterProps["theme"]} position="bottom-right" {...props} />;
}
