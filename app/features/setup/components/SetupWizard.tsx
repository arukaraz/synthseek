"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuthContext } from "@modules/providers/AuthProvider";

import { STEPS } from "../constants";
import { AdminStep } from "../steps/AdminStep";
import { DoneStep } from "../steps/DoneStep";
import { EnrichmentStep } from "../steps/EnrichmentStep";
import { PlexStep } from "../steps/PlexStep";
import { SlskdStep } from "../steps/SlskdStep";
import type { WizardStep } from "../types";

export function SetupWizard() {
  const router = useRouter();
  const { currentUser } = useAuthContext();

  const adminAlreadyExists = Boolean(currentUser);
  const [step, setStep] = useState<WizardStep>(adminAlreadyExists ? "slskd" : "admin");
  const [adminShown, setAdminShown] = useState(!adminAlreadyExists);

  const stepIndex = STEPS.indexOf(step);
  const totalSteps = STEPS.length;

  const goTo = (next: WizardStep) => setStep(next);

  switch (step) {
    case "admin":
      return (
        <AdminStep
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          onComplete={() => {
            setAdminShown(true);
            goTo("slskd");
          }}
        />
      );
    case "slskd":
      return (
        <SlskdStep
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          onComplete={() => goTo("plex")}
          onBack={adminShown ? () => goTo("admin") : undefined}
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
