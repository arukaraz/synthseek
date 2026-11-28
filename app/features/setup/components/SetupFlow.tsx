"use client";

import { useSetupFlow } from "../hooks/useSetupFlow";
import { SetupLoadError } from "./SetupLoadError";
import { SetupSkeleton } from "./SetupSkeleton";
import { SetupStepSwitch } from "./SetupStepSwitch";

export function SetupFlow() {
  const { state, go } = useSetupFlow();

  if (state.kind === "loading") return <SetupSkeleton />;
  if (state.kind === "error") return <SetupLoadError retry={state.retry} />;

  return <SetupStepSwitch step={state.step} server={state.server} onGo={go} />;
}
