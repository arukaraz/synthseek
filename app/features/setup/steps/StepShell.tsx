"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { AppLogo } from "@components/ui/AppLogo";
import { authForwardButton, authQuietButton } from "@components/ui/styles";
import { cn } from "@utils/cn";

import {
  stepBody,
  stepDescription,
  stepFooter,
  stepFooterTrailing,
  stepHeader,
  stepIndicator,
  stepProgress,
  stepTitle,
  wizardBody,
  wizardBrand,
  wizardCard,
  wizardEyebrow,
  wizardHead,
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
  const { t } = useTranslation("setup");
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [headingId]);

  const hintId = `${headingId}-primary-hint`;
  const showHint = Boolean(primaryDisabled && primaryHint);

  return (
    <div className={wizardCard()}>
      <div className={wizardHead()}>
        <header className={wizardBrand()}>
          <AppLogo iconClassName="h-9 w-auto sm:h-10" wordmarkClassName="sm:text-3xl" />
          <p className={wizardEyebrow()}>{t("shell.eyebrow")}</p>
        </header>

        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuenow={stepIndex + 1}
          aria-valuetext={t("shell.progress", { current: stepIndex + 1, total: totalSteps })}
          className={stepProgress()}
        >
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={stepIndicator({
                state: i < stepIndex ? "completed" : i === stepIndex ? "current" : "upcoming",
              })}
            />
          ))}
        </div>
      </div>

      <div className={wizardBody()}>
        <header className={stepHeader()}>
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
          <button
            type={primaryType}
            onClick={onPrimary}
            disabled={primaryDisabled || primaryLoading}
            aria-busy={primaryLoading || undefined}
            aria-describedby={showHint ? hintId : undefined}
            className={authForwardButton({ blocked: Boolean(primaryDisabled) && !primaryLoading })}
          >
            {primaryLabel}
          </button>
          {secondaryLabel ? (
            <button type="button" onClick={onSecondary} disabled={primaryLoading} className={authQuietButton()}>
              {secondaryLabel}
            </button>
          ) : null}
        </div>
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            disabled={primaryLoading}
            className={cn(authQuietButton(), "sm:order-first")}
          >
            {t("shell.back")}
          </button>
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
