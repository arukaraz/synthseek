import i18n from "@locale";
import { extractAppCode, extractAppParams, resolveFriendlyError } from "@modules/errors";
import { ACCOUNT_FIELD_RULES } from "@utils/account";

import { DEFAULT_RETRY_AFTER_SECONDS, EMAIL_SCHEMA, QUESTION_COUNT, SENTENCE_ENDINGS, SETUP_STEPS } from "./constants";
import type {
  AccountDraft,
  AccountFieldErrors,
  ConnectionState,
  ServerTestOutcome,
  SetupFailure,
  SetupOutcome,
  SetupProgress,
  SetupStepId,
  SummaryRowData,
} from "./types";

const TIMEOUT_MARKER = "timed out";
const HTTP_PROTOCOLS: readonly string[] = ["http:", "https:"];

export function isPlexTimeoutMessage(message: string): boolean {
  return message.toLowerCase().includes(TIMEOUT_MARKER);
}

export function isValidEmail(value: string): boolean {
  return EMAIL_SCHEMA.safeParse(value.trim()).success;
}

export function isHttpUrl(value: string): boolean {
  try {
    return HTTP_PROTOCOLS.includes(new URL(value.trim()).protocol);
  } catch {
    return false;
  }
}

export function resumeStepOf(progress: SetupProgress): SetupStepId {
  const { resumeAt } = progress;
  if (resumeAt === null) return "summary";
  return resumeAt === "account" ? "media" : resumeAt;
}

export function stepNumberOf(step: SetupStepId): number {
  return Math.min(SETUP_STEPS.indexOf(step) + 1, QUESTION_COUNT);
}

export function progressPercentOf(step: SetupStepId): number {
  return step === "summary" ? 100 : (stepNumberOf(step) / QUESTION_COUNT) * 100;
}

export function accountErrorsOf(draft: AccountDraft, tokenRequired: boolean): AccountFieldErrors {
  const errors: AccountFieldErrors = {};
  const username = draft.username.trim();
  if (tokenRequired && draft.token.trim().length === 0) errors.token = i18n.t("setup:account.tokenMissing");
  if (!isValidEmail(draft.email)) errors.email = i18n.t("setup:account.emailError");
  if (username.length < ACCOUNT_FIELD_RULES.usernameMin || username.length > ACCOUNT_FIELD_RULES.usernameMax) {
    errors.username = i18n.t("setup:account.usernameError");
  }
  if (draft.password.length < ACCOUNT_FIELD_RULES.passwordMin) errors.password = i18n.t("setup:account.passwordError");
  return errors;
}

function retryAfterSecondsOf(error: unknown): number {
  const seconds = extractAppParams(error)?.retryAfterSeconds;
  return typeof seconds === "number" && Number.isFinite(seconds) && seconds > 0
    ? Math.ceil(seconds)
    : DEFAULT_RETRY_AFTER_SECONDS;
}

function asSentence(text: string): string {
  return SENTENCE_ENDINGS.some((ending) => text.endsWith(ending)) ? text : `${text}.`;
}

export function failureTextOf(error: unknown, fallback: string): string {
  const friendly = resolveFriendlyError(error, { fallback: { title: fallback } });
  return friendly.description ? `${asSentence(friendly.title)} ${friendly.description}` : friendly.title;
}

export function setupFailureOf(error: unknown): SetupFailure {
  const code = extractAppCode(error);
  if (code === "TOO_MANY_LOGIN_ATTEMPTS") return { kind: "throttled", retryAfterSeconds: retryAfterSecondsOf(error) };
  const text = failureTextOf(error, i18n.t("setup:account.createError"));
  return code === "SETUP_TOKEN_INVALID" ? { kind: "token", text } : { kind: "message", text };
}

export function connectionStateOf(outcome: ServerTestOutcome, server: string): ConnectionState {
  if (outcome === "ok") return { kind: "passed" };
  const reason =
    outcome === "unauthorized"
      ? i18n.t("setup:connect.unauthorized", { server })
      : i18n.t("setup:connect.unreachable", { server });
  return { kind: "failed", reason };
}

function summaryValueOf(outcome: SetupOutcome | null): string {
  if (outcome === "answered") return i18n.t("setup:summary.answered");
  return outcome === "skipped" ? i18n.t("setup:summary.skipped") : i18n.t("setup:summary.open");
}

export function summaryRowsOf(progress: SetupProgress, username: string): SummaryRowData[] {
  return progress.questions.map((question) => ({
    key: question.id,
    label: i18n.t(`setup:summary.questions.${question.id}`),
    value: question.id === "account" ? username : summaryValueOf(question.outcome),
    outcome: question.outcome,
  }));
}
