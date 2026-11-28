"use client";

import { useCallback, useEffect } from "react";

import { useSetupProgress } from "@hooks/api/queries/setup/useSetupProgress";
import { useUrlParams } from "@hooks/ui/useUrlParam";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { SETUP_URL_SCHEMA } from "../constants";
import { resumeStepOf } from "../helpers";
import type { SetupFlowState, SetupNavigate } from "../types";

export function useSetupFlow(): { state: SetupFlowState; go: SetupNavigate } {
  const { currentUser } = useAuthContext();
  const signedIn = currentUser !== null;
  const progress = useSetupProgress({ enabled: signedIn });
  const { values, setMany } = useUrlParams(SETUP_URL_SCHEMA);

  const go = useCallback<SetupNavigate>(
    (step, server) => setMany({ question: step, server: server ?? null }),
    [setMany]
  );

  const data = progress.data;
  const resume = data ? resumeStepOf(data) : null;
  const needsResume = signedIn && resume !== null && (values.question === undefined || values.question === "account");

  useEffect(() => {
    if (needsResume && resume !== null) go(resume);
  }, [needsResume, resume, go]);

  if (!signedIn) return { state: { kind: "step", step: "account", server: null }, go };
  if (progress.isError && !data) return { state: { kind: "error", retry: () => void progress.refetch() }, go };
  if (!data || needsResume) return { state: { kind: "loading" }, go };

  const step = values.question ?? resumeStepOf(data);
  return { state: { kind: "step", step, server: step === "media" ? (values.server ?? null) : null }, go };
}
