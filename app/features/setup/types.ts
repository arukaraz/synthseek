import type { ReactNode } from "react";

export type WizardStep = "admin" | "slskd" | "plex" | "enrichment" | "done";

export type StatusStripTone = "success" | "error" | "neutral";

export type StatusStripLive = "polite" | "assertive";

export interface StatusStripProps {
  tone: StatusStripTone;
  message: ReactNode;
  live?: StatusStripLive;
  action?: ReactNode;
  className?: string;
}

export interface StepShellProps {
  stepIndex: number;
  totalSteps: number;
  title: string;
  description?: string;
  headingId: string;
  primaryLabel: string;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  primaryHint?: string;
  primaryType?: "button" | "submit";
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  footerError?: ReactNode;
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
  onBack?: () => void;
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

export type SlskdConnectState =
  | { kind: "untested" }
  | { kind: "testing" }
  | { kind: "passed" }
  | { kind: "failed"; reason?: string }
  | { kind: "override-armed" }
  | { kind: "saving" }
  | { kind: "save-failed" };

export type DoneState = { kind: "resting" } | { kind: "completing" } | { kind: "failed" };
