import type { PlayerTrack } from "@components/Player";

import { DIAGNOSTICS, MAX_CONSECUTIVE_FAILURES } from "./constants";
import { thrownCause } from "./failure-cause";
import type {
  DiagnosticsSink,
  EngineFailureDetail,
  FailureAt,
  FailureOutcome,
  PlayerDiagnosticEvent,
  PlayerDiagnosticHelper,
  PlayerUpcomingStage,
  RecordedDiagnostic,
  SkipDirection,
} from "./types";

let sink: DiagnosticsSink | null = null;
const pending: RecordedDiagnostic[] = [];

export function setDiagnosticsSink(next: DiagnosticsSink | null): void {
  sink = next;
  if (next === null) return;
  for (const event of pending.splice(0)) next(event);
}

export function recordDiagnostic(event: RecordedDiagnostic): void {
  if (sink !== null) {
    sink(event);
    return;
  }
  if (pending.length >= DIAGNOSTICS.MAX_BUFFERED) pending.shift();
  pending.push(event);
}

function clipped(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) : text;
}

export function diagnosticBase(
  track: PlayerTrack | null,
  positionSeconds: number
): Pick<RecordedDiagnostic, "trackId" | "label" | "positionSeconds" | "at"> {
  const seconds = Number.isFinite(positionSeconds) ? positionSeconds : 0;
  return {
    trackId: track === null ? null : clipped(track.id, DIAGNOSTICS.MAX_TRACK_ID_LENGTH),
    label: track === null ? null : clipped(`${track.artist} - ${track.title}`, DIAGNOSTICS.MAX_LABEL_LENGTH),
    positionSeconds: Math.min(Math.max(0, seconds), DIAGNOSTICS.MAX_POSITION_SECONDS),
    at: Date.now(),
  };
}

export function sendable(event: RecordedDiagnostic, now: number): PlayerDiagnosticEvent {
  const { at, ...rest } = event;
  return { ...rest, ageMs: Math.min(Math.max(0, Math.round(now - at)), DIAGNOSTICS.MAX_AGE_MS) };
}

export function recordFailure(
  at: FailureAt,
  outcome: FailureOutcome,
  failures: number,
  sources: { failed: string | null; next: string | null }
): void {
  recordDiagnostic({
    ...diagnosticBase(at.track, at.positionSeconds),
    kind: "failure",
    reason: at.reason,
    outcome,
    engine: at.detail.engine,
    cause: clipped(at.detail.cause, DIAGNOSTICS.MAX_CAUSE_LENGTH),
    failures,
    maxFailures: MAX_CONSECUTIVE_FAILURES,
    failedSource: sources.failed === null ? null : clipped(sources.failed, DIAGNOSTICS.MAX_SOURCE_LENGTH),
    nextSource: sources.next === null ? null : clipped(sources.next, DIAGNOSTICS.MAX_SOURCE_LENGTH),
  });
}

export function recordUpcoming(
  track: PlayerTrack | null,
  positionSeconds: number,
  stage: PlayerUpcomingStage,
  detail: EngineFailureDetail
): void {
  recordDiagnostic({
    ...diagnosticBase(track, positionSeconds),
    kind: "upcomingRefused",
    stage,
    engine: detail.engine,
    cause: clipped(detail.cause, DIAGNOSTICS.MAX_CAUSE_LENGTH),
  });
}

export function recordUserSkip(track: PlayerTrack | null, positionSeconds: number, direction: SkipDirection): void {
  recordDiagnostic({ ...diagnosticBase(track, positionSeconds), kind: "userSkip", direction });
}

export function recordHandOverFailed(track: PlayerTrack | null, positionSeconds: number, targetDevice: string): void {
  recordDiagnostic({
    ...diagnosticBase(track, positionSeconds),
    kind: "handOverFailed",
    targetDevice: clipped(targetDevice, DIAGNOSTICS.MAX_LABEL_LENGTH),
  });
}

export function recordDroppedCommand(command: string, error: unknown): void {
  recordDiagnostic({
    ...diagnosticBase(null, 0),
    kind: "remoteCommandDropped",
    command: clipped(command, DIAGNOSTICS.MAX_COMMAND_LENGTH),
    cause: clipped(thrownCause(error), DIAGNOSTICS.MAX_CAUSE_LENGTH),
  });
}

export function recordHelperFailure(helper: PlayerDiagnosticHelper, error: unknown): void {
  recordDiagnostic({
    ...diagnosticBase(null, 0),
    kind: "helperFailed",
    helper,
    cause: clipped(thrownCause(error), DIAGNOSTICS.MAX_CAUSE_LENGTH),
  });
}
