"use client";

import { useSetupRedirect } from "@hooks/ui/useSetupRedirect";

import { SetupSkeleton } from "./components/SetupSkeleton";
import { SetupWizard } from "./components/SetupWizard";

export function SetupScreen() {
  const gate = useSetupRedirect("setup");

  if (gate.status !== "ready") return <SetupSkeleton />;

  return <SetupWizard />;
}
