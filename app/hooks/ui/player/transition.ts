import { z } from "zod";

import type { PlayerTransition, TransitionCurve, TransitionMode } from "@components/Player";

import {
  CROSSFADE_MIN_TRACK_RATIO,
  FADE_CURVE_POINTS,
  HANDOFF_LEAD_SECONDS,
  PRIME_AHEAD_SECONDS,
  TRANSITION_CURVES,
  TRANSITION_DEFAULT_SECONDS,
  TRANSITION_MAX_SECONDS,
  TRANSITION_MIN_SECONDS,
  TRANSITION_MODES,
  TRANSITION_STEP_SECONDS,
} from "./constants";
import type { FadeDirection, TransitionReason } from "./types";

const storedTransition = z.object({
  mode: z.enum(TRANSITION_MODES),
  seconds: z.number().min(TRANSITION_MIN_SECONDS).max(TRANSITION_MAX_SECONDS),
  curve: z.enum(TRANSITION_CURVES),
});

export function isTransitionMode(value: string): value is TransitionMode {
  return TRANSITION_MODES.some((mode) => mode === value);
}

export function isTransitionCurve(value: string): value is TransitionCurve {
  return TRANSITION_CURVES.some((curve) => curve === value);
}

export function defaultTransition(): PlayerTransition {
  return { mode: "gapless", seconds: TRANSITION_DEFAULT_SECONDS, curve: "equalPower" };
}

export function restorableTransition(raw: string | null): PlayerTransition | null {
  if (raw === null) return null;
  try {
    const parsed = storedTransition.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function steppedTransitionSeconds(value: number): number {
  if (!Number.isFinite(value)) return TRANSITION_DEFAULT_SECONDS;
  const stepped = Math.round(value / TRANSITION_STEP_SECONDS) * TRANSITION_STEP_SECONDS;
  return Math.min(TRANSITION_MAX_SECONDS, Math.max(TRANSITION_MIN_SECONDS, stepped));
}

export function sameTransition(a: PlayerTransition, b: PlayerTransition): boolean {
  return a.mode === b.mode && a.seconds === b.seconds && a.curve === b.curve;
}

export function transitionFadeSeconds(settings: PlayerTransition, reason: TransitionReason): number {
  if (settings.mode === "crossfade") return settings.seconds;
  if (settings.mode === "smart" && reason === "skip") return settings.seconds;
  return 0;
}

export function fadeAllowed(fadeSeconds: number, outgoingSeconds: number, incomingSeconds: number): number {
  if (fadeSeconds <= 0) return 0;
  const floor = fadeSeconds * CROSSFADE_MIN_TRACK_RATIO;
  if (outgoingSeconds > 0 && outgoingSeconds < floor) return 0;
  if (incomingSeconds > 0 && incomingSeconds < floor) return 0;
  return fadeSeconds;
}

export function fadeGain(curve: TransitionCurve, direction: FadeDirection, progress: number): number {
  const p = Math.min(1, Math.max(0, progress));
  if (curve === "linear") return direction === "in" ? p : 1 - p;
  return direction === "in" ? Math.sin((p * Math.PI) / 2) : Math.cos((p * Math.PI) / 2);
}

export function fadeCurveValues(
  curve: TransitionCurve,
  direction: FadeDirection,
  peak: number,
  points = FADE_CURVE_POINTS
): Float32Array {
  const count = Math.max(2, Math.floor(points));
  const values = new Float32Array(count);
  for (let at = 0; at < count; at += 1) {
    values[at] = fadeGain(curve, direction, at / (count - 1)) * peak;
  }
  return values;
}

export function primeDue(positionSeconds: number, durationSeconds: number, fadeSeconds: number): boolean {
  if (!(durationSeconds > 0)) return false;
  return positionSeconds >= durationSeconds - PRIME_AHEAD_SECONDS - fadeSeconds;
}

export function handoffLeadSeconds(fadeSeconds: number): number {
  return fadeSeconds > 0 ? fadeSeconds : HANDOFF_LEAD_SECONDS;
}
