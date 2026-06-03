"use client";

import { type ReactNode } from "react";

import { BrandedLoader } from "@components/ui/BrandedLoader";
import { useSetupRedirect } from "@hooks/ui/useSetupRedirect";

export function AuthGuard({ children }: { children: ReactNode }) {
  const gate = useSetupRedirect("app");

  if (gate.status === "resolving") return <BrandedLoader label="Loading your library" />;
  if (gate.status !== "ready") return null;

  return <>{children}</>;
}
