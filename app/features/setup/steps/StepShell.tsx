"use client";

import { useEffect, useRef } from "react";

import { Button } from "@components/ui/Button";
import { cn } from "@utils/cn";

import {
  stepBackButton,
  stepBody,
  stepDescription,
  stepEyebrow,
  stepFooter,
  stepFooterTrailing,
  stepHeader,
  stepIndicator,
  stepPrimaryButton,
  stepProgress,
  stepSecondaryButton,
  stepShellRoot,
  stepShellScroll,
  stepTitle,
} from "../styles";
import type { StepShellProps } from "../types";

export function StepShell({
  stepIndex,
  totalSteps,
  title,
  description,
  headingId,
  primaryLabel,
  primaryDisabled,
  primaryLoading,
  primaryHint,
  primaryType = "button",
  onPrimary,
  secondaryLabel,
  onSecondary,
  showBack,
  onBack,
  footerError,
  children,
}: StepShellProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [headingId]);

  const hintId = `${headingId}-primary-hint`;
  const showHint = Boolean(primaryDisabled && primaryHint);

  return (
    <div className={stepShellRoot()}>
      <div className={stepShellScroll()}>
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuenow={stepIndex + 1}
          aria-valuetext={`Step ${stepIndex + 1} of ${totalSteps}`}
          className={stepProgress()}
        >
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={stepIndicator({ state: i <= stepIndex ? "filled" : "empty" })}
            />
          ))}
        </div>

        <header className={stepHeader()}>
          <span className={stepEyebrow()}>
            Step {stepIndex + 1} of {totalSteps}
          </span>
          <h1 ref={headingRef} id={headingId} tabIndex={-1} className={stepTitle()}>
            {title}
          </h1>
          {description ? <p className={stepDescription()}>{description}</p> : null}
        </header>

        <div className={stepBody()}>{children}</div>

        {footerError ? footerError : null}
      </div>

      <footer className={stepFooter()}>
        <div className={stepFooterTrailing()}>
          <Button
            type={primaryType}
            onClick={onPrimary}
            disabled={primaryDisabled || primaryLoading}
            aria-describedby={showHint ? hintId : undefined}
            className={cn(stepPrimaryButton({ blocked: Boolean(primaryDisabled) && !primaryLoading }))}
          >
            {primaryLabel}
          </Button>
          {secondaryLabel ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSecondary}
              disabled={primaryLoading}
              className={stepSecondaryButton()}
            >
              {secondaryLabel}
            </Button>
          ) : null}
        </div>
        {showBack ? (
          <Button variant="ghost" size="sm" onClick={onBack} disabled={primaryLoading} className={stepBackButton()}>
            Back
          </Button>
        ) : (
          <span className="hidden sm:order-first sm:block" />
        )}
        {showHint ? (
          <span id={hintId} className="sr-only">
            {primaryHint}
          </span>
        ) : null}
      </footer>
    </div>
  );
}
