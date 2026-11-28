"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { AccessibilityPanel } from "@components/AccessibilityPanel";
import { AppLogo } from "@components/ui/AppLogo";

import { QUESTION_COUNT } from "../constants";
import { progressPercentOf, stepNumberOf } from "../helpers";
import {
  setupAsk,
  setupDescription,
  setupEyebrow,
  setupFooter,
  setupHeader,
  setupProgressFill,
  setupProgressText,
  setupProgressTrack,
  setupQuestion,
} from "../styles";
import type { QuestionFrameProps } from "../types";

export function QuestionFrame({ step, focusKey, title, description, children }: QuestionFrameProps) {
  const { t } = useTranslation("setup");
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [focusKey]);

  const isSummary = step === "summary";
  const number = stepNumberOf(step);
  const eyebrow = isSummary ? t("frame.steps.summary") : t("frame.label", { number, name: t(`frame.steps.${step}`) });
  const progress = isSummary
    ? t("frame.progressReady", { total: QUESTION_COUNT })
    : t("frame.progress", { current: number, total: QUESTION_COUNT });

  return (
    <>
      <div aria-hidden="true" className={setupProgressTrack()}>
        <span className={setupProgressFill()} style={{ width: `${progressPercentOf(step)}%` }} />
      </div>
      <section className={setupAsk()}>
        <AppLogo iconClassName="h-9 w-auto" wordmarkClassName="text-2xl" />
        <header className={setupHeader()}>
          <p className={setupEyebrow()}>{eyebrow}</p>
          <h1 ref={headingRef} tabIndex={-1} className={setupQuestion()}>
            {title}
          </h1>
          {description ? <p className={setupDescription()}>{description}</p> : null}
        </header>
        {children}
        <footer className={setupFooter()}>
          <p className={setupProgressText()}>{progress}</p>
          <AccessibilityPanel />
        </footer>
      </section>
    </>
  );
}
