"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuthContext } from "@modules/providers/AuthProvider";
import { trpc } from "@utils/trpc";

import { AdminStep } from "./steps/AdminStep";
import { DoneStep } from "./steps/DoneStep";
import { EnrichmentStep } from "./steps/EnrichmentStep";
import { PlexStep } from "./steps/PlexStep";
import { SlskdStep } from "./steps/SlskdStep";

type WizardStep = "admin" | "slskd" | "plex" | "enrichment" | "done";

const STEPS: WizardStep[] = ["admin", "slskd", "plex", "enrichment", "done"];

export function SetupWizard() {
  const router = useRouter();
  const setupQuery = trpc.auth.setupRequired.useQuery();
  const { currentUser } = useAuthContext();

  const initialStep: WizardStep = currentUser ? "slskd" : "admin";
  const [step, setStep] = useState<WizardStep>(initialStep);

  useEffect(() => {
    if (currentUser && step === "admin") setStep("slskd");
  }, [currentUser, step]);

  useEffect(() => {
    if (setupQuery.data === false) {
      router.replace("/");
    }
  }, [router, setupQuery.data]);

  if (setupQuery.isLoading) return null;

  const stepIndex = STEPS.indexOf(step);
  const totalSteps = STEPS.length;

  const goTo = (next: WizardStep) => setStep(next);

  switch (step) {
    case "admin":
      return <AdminStep stepIndex={stepIndex} totalSteps={totalSteps} onComplete={() => goTo("slskd")} />;
    case "slskd":
      return (
        <SlskdStep
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          onComplete={() => goTo("plex")}
          onBack={() => goTo("admin")}
        />
      );
    case "plex":
      return (
        <PlexStep
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          onComplete={() => goTo("enrichment")}
          onSkip={() => goTo("enrichment")}
          onBack={() => goTo("slskd")}
        />
      );
    case "enrichment":
      return (
        <EnrichmentStep
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          onComplete={() => goTo("done")}
          onSkip={() => goTo("done")}
          onBack={() => goTo("plex")}
        />
      );
    case "done":
      return <DoneStep stepIndex={stepIndex} totalSteps={totalSteps} onFinish={() => router.replace("/")} />;
  }
}
