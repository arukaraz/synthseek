"use client";

import type { ReactNode } from "react";

import { Button } from "@components/ui/Button";

import { stepEyebrow, stepIndicator, stepShellRoot } from "../styles";

interface StepShellProps {
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

export function StepShell({
  stepIndex,
  totalSteps,
  title,
  description,
  primaryLabel,
  primaryDisabled,
  primaryLoading,
  onPrimary,
  secondaryLabel,
  onSecondary,
  showBack,
  onBack,
  children,
}: StepShellProps) {
  return (
    <div className={stepShellRoot()}>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span key={i} className={stepIndicator({ state: i <= stepIndex ? "filled" : "empty" })} />
        ))}
      </div>

      <header className="flex flex-col gap-1.5">
        <span className={stepEyebrow()}>
          Step {stepIndex + 1} of {totalSteps}
        </span>
        <h1 className="text-fg text-2xl font-bold">{title}</h1>
        {description ? <p className="text-fg/60 text-sm">{description}</p> : null}
      </header>

      <div className="flex flex-col gap-3">{children}</div>

      <footer className="mt-2 flex items-center justify-between gap-3">
        {showBack ? (
          <Button variant="ghost" size="sm" onClick={onBack} disabled={primaryLoading}>
            Back
          </Button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          {secondaryLabel ? (
            <Button variant="ghost" size="sm" onClick={onSecondary} disabled={primaryLoading}>
              {secondaryLabel}
            </Button>
          ) : null}
          <Button onClick={onPrimary} disabled={primaryDisabled || primaryLoading}>
            {primaryLoading ? "Working..." : primaryLabel}
          </Button>
        </div>
      </footer>
    </div>
  );
}
