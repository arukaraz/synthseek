"use client";

import { Suspense } from "react";

import { useSetupRedirect } from "@hooks/ui/useSetupRedirect";

import { SetupFlow } from "./components/SetupFlow";
import { SetupLoadError } from "./components/SetupLoadError";
import { SetupSkeleton } from "./components/SetupSkeleton";

export function SetupScreen() {
  const gate = useSetupRedirect("setup");

  if (gate.status === "error") return <SetupLoadError retry={gate.retry} />;
  if (gate.status !== "ready") return <SetupSkeleton />;

  return (
    <Suspense fallback={<SetupSkeleton />}>
      <SetupFlow />
    </Suspense>
  );
}
