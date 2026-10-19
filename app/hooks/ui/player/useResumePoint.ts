"use client";

import { useSyncExternalStore } from "react";

import { resumePointOf, sameResumePoint } from "./helpers";
import { actions, getSnapshot, subscribe } from "./store";
import type { ResumeControls, ResumePoint } from "./types";

let resumePoint: ResumePoint | null = null;

export function resumePointSnapshot(): ResumePoint | null {
  const next = resumePointOf(getSnapshot());
  if (next === null || resumePoint === null || !sameResumePoint(resumePoint, next)) resumePoint = next;
  return resumePoint;
}

export function useResumePoint(): ResumeControls {
  const point = useSyncExternalStore(subscribe, resumePointSnapshot, () => null);
  return { point, toggle: actions.togglePlay };
}
