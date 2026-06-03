"use client";

import { type ReactNode } from "react";

import { useSetupRedirect } from "@hooks/ui/useSetupRedirect";

export function AuthGuard({ children }: { children: ReactNode }) {
  const gate = useSetupRedirect("app");

  if (gate.status !== "ready") return null;

  return <>{children}</>;
}
