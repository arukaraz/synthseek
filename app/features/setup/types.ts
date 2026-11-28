import type { AppRouter } from "@api/__generated__/types";
import type { LucideIcon } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import type { ReactNode, Ref } from "react";

import type { PlaybackServerKey } from "@utils/playback-servers";

export type SetupProgress = inferRouterOutputs<AppRouter>["settings"]["setup"]["progress"];

export type SetupQuestionId = SetupProgress["questions"][number]["id"];

export type SetupStepId = SetupQuestionId | "summary";

export type RecordableQuestionId = Exclude<SetupQuestionId, "account">;

export type SetupOutcome = NonNullable<SetupProgress["questions"][number]["outcome"]>;

export type MediaServerChoice = PlaybackServerKey;

export type SetupNavigate = (step: SetupStepId, server?: MediaServerChoice) => void;

export type SetupFlowState =
  | { kind: "loading" }
  | { kind: "error"; retry: () => void }
  | { kind: "step"; step: SetupStepId; server: MediaServerChoice | null };

export interface StepProps {
  onGo: SetupNavigate;
}

export interface MediaConnectStepProps extends StepProps {
  server: MediaServerChoice;
}

export interface QuestionFrameProps {
  step: SetupStepId;
  focusKey: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export type StatusStripTone = "success" | "error" | "neutral";

export type StatusStripLive = "polite" | "assertive";

export interface StatusStripProps {
  tone: StatusStripTone;
  message: ReactNode;
  live?: StatusStripLive;
  action?: ReactNode;
  className?: string;
}

export interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: LucideIcon;
  type?: "text" | "email" | "url";
  autoComplete: string;
  placeholder?: string;
  hint?: string;
  error?: string | null;
  inputRef?: Ref<HTMLInputElement>;
  id?: string;
  minLength?: number;
  maxLength?: number;
}

export interface FieldNoteProps {
  id: string;
  tone: "hint" | "error";
  children: ReactNode;
}

export interface StepActionsProps {
  onBack?: () => void;
  onSkip?: () => void;
  forwardLabel: string;
  forwardBusy?: boolean;
  forwardDisabled?: boolean;
  onForward?: () => void;
  forwardType?: "button" | "submit";
}

export interface TestButtonProps {
  testing: boolean;
  disabled: boolean;
  idleLabel: string;
  busyLabel: string;
  onTest: () => void;
}

export interface ConnectionStatusProps {
  state: ConnectionState;
  passedText: string;
  failedText: string;
  override?: { label: string; armedText: string; onArm: () => void };
}

export interface ConnectionCheck {
  state: ConnectionState;
  check: (run: () => Promise<ConnectionState>) => Promise<void>;
  reset: () => void;
  override: () => void;
}

export interface RecordStep {
  record: (outcome: SetupOutcome, next: SetupStepId) => Promise<void>;
  pending: boolean;
  failure: string | null;
  clearFailure: () => void;
}

export interface SetupLoadErrorProps {
  retry: () => void;
}

export interface SetupStepSwitchProps {
  step: SetupStepId;
  server: MediaServerChoice | null;
  onGo: SetupNavigate;
}

export type ServerTestOutcome = "ok" | "unauthorized" | "failed";

export interface ChoiceTileData {
  key: string;
  title: string;
  caption: string;
}

export interface ChoiceTilesProps {
  label: string;
  choices: readonly ChoiceTileData[];
  selected: string | null;
  disabled?: boolean;
  onChoose: (key: string) => void;
}

export interface RetryNoticeProps {
  deadline: number;
  retryAfterSeconds: number;
}

export type SetupFailure =
  | { kind: "throttled"; retryAfterSeconds: number }
  | { kind: "token"; text: string }
  | { kind: "message"; text: string };

export type AccountAttemptState =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "rejected"; failure: Exclude<SetupFailure, { kind: "throttled" }> }
  | { kind: "throttled"; deadline: number; retryAfterSeconds: number }
  | { kind: "released" };

export interface AccountDraft {
  email: string;
  username: string;
  password: string;
  token: string;
}

export type AccountFieldErrors = Partial<Record<keyof AccountDraft, string>>;

export type ConnectionState =
  | { kind: "untested" }
  | { kind: "testing" }
  | { kind: "passed" }
  | { kind: "failed"; reason?: string }
  | { kind: "override" };
export interface SummaryRowData {
  key: SetupQuestionId;
  label: string;
  value: string;
  outcome: SetupOutcome | null;
}

export interface SummaryRowProps {
  label: string;
  value: string;
  outcome: SetupOutcome | null;
}
