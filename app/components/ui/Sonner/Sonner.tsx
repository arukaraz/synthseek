"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { resolveSonnerTheme } from "./helpers";
import type { ToasterProps } from "./types";

export function Toaster({ ...props }: ToasterProps) {
  const { theme } = useTheme();
  return (
    <Sonner theme={resolveSonnerTheme(theme)} position="bottom-right" richColors closeButton gap={12} {...props} />
  );
}
