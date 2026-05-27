import type { ReactNode } from "react";

export type WizardStep = "admin" | "slskd" | "plex" | "enrichment" | "done";

export interface StepShellProps {
  stepIndex: number;
  totalSteps: number;
  title: string;
  description?: string;
  primaryLabel: string;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  children: ReactNode;
}

export interface AdminStepProps {
  stepIndex: number;
  totalSteps: number;
  onComplete: () => void;
}

export interface SlskdStepProps {
  stepIndex: number;
  totalSteps: number;
  onComplete: () => void;
  onBack: () => void;
}

export interface PlexStepProps {
  stepIndex: number;
  totalSteps: number;
  onComplete: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export interface EnrichmentStepProps {
  stepIndex: number;
  totalSteps: number;
  onComplete: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export interface DoneStepProps {
  stepIndex: number;
  totalSteps: number;
  onFinish: () => void;
}
