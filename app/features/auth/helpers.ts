import i18n from "@locale";
import type { PlexPinFailure } from "@hooks/ui/types";
import { extractAppCode, extractAppParams, resolveByCode, resolveFriendlyError } from "@modules/errors";
import { LOGIN_PATH } from "@utils/returnPath";
import { callbackErrorOf } from "@utils/sign-in-callback";

import { DEFAULT_RETRY_AFTER_SECONDS, STARTABLE_METHOD_IDS } from "./constants";
import type {
  CallbackFailure,
  FailureMessage,
  PlexFailure,
  SignInFailure,
  SignInMethodsData,
  SignInPlan,
} from "./types";

const SECONDS_PER_MINUTE = 60;

export function signInPlanOf(data: SignInMethodsData | undefined): SignInPlan {
  if (data === undefined) return { external: [], local: true, usable: true, primary: null, autoRedirect: null };
  const local = data.methods.some((method) => method.id === "local");
  const external = data.methods.filter((method) => STARTABLE_METHOD_IDS.includes(method.id));
  const offered = (id: string | null) => external.find((method) => method.id === id) ?? null;
  return {
    external,
    local,
    usable: local || external.length > 0,
    primary: offered(data.primary),
    autoRedirect: offered(data.autoRedirect),
  };
}

function retryAfterSecondsOf(error: unknown): number {
  const seconds = extractAppParams(error)?.retryAfterSeconds;
  return typeof seconds === "number" && Number.isFinite(seconds) && seconds > 0
    ? Math.ceil(seconds)
    : DEFAULT_RETRY_AFTER_SECONDS;
}

function friendlyMessageOf(error: unknown): FailureMessage {
  const friendly = resolveFriendlyError(error, { fallback: { title: i18n.t("auth:auth.login.errors.generic") } });
  return friendly.description
    ? { title: friendly.title, description: friendly.description }
    : { title: friendly.title };
}

export function signInFailureOf(
  error: unknown,
  invalidCredentialsTitle: string = i18n.t("auth:auth.login.errors.invalidCredentials")
): SignInFailure {
  const code = extractAppCode(error);
  if (code === "TOO_MANY_LOGIN_ATTEMPTS") return { kind: "throttled", retryAfterSeconds: retryAfterSecondsOf(error) };
  if (code === "PLEX_SIGN_IN_NEEDS_SETUP") return { kind: "needsSetup" };
  if (code === "ACCOUNT_PENDING_APPROVAL") return { kind: "pendingApproval" };
  if (code === "INVALID_CREDENTIALS") return { kind: "message", title: invalidCredentialsTitle };
  return { kind: "message", ...friendlyMessageOf(error) };
}

export function plexFailureOf(failure: PlexPinFailure): PlexFailure {
  if (failure.kind === "popupBlocked") return { kind: "message", title: i18n.t("auth:auth.plex.popupBlocked") };
  if (failure.kind === "timeout") return { kind: "message", title: i18n.t("auth:auth.plex.timeout") };
  const outcome = signInFailureOf(failure.error);
  if (outcome.kind === "throttled") return { kind: "message", ...friendlyMessageOf(failure.error) };
  return outcome;
}

export function startFailureOf(error: unknown): CallbackFailure {
  const outcome = signInFailureOf(error);
  if (outcome.kind === "pendingApproval") return outcome;
  if (outcome.kind === "message") return outcome;
  return { kind: "message", ...friendlyMessageOf(error) };
}

export function escapeHrefOf(search: string, param: string): string {
  const query = new URLSearchParams(search);
  query.set(param, "");
  return `${LOGIN_PATH}?${query.toString()}`;
}

export function callbackFailureFrom(search: string): CallbackFailure | null {
  const coded = callbackErrorOf(search);
  if (coded === null) return null;
  if (coded.appCode === "ACCOUNT_PENDING_APPROVAL") return { kind: "pendingApproval" };
  const friendly = resolveByCode(coded.appCode, coded.appParams);
  return { kind: "message", title: friendly.title, description: friendly.description };
}

export function clockOf(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const rest = seconds % SECONDS_PER_MINUTE;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function spokenDurationOf(totalSeconds: number, locale: string): string {
  const useMinutes = totalSeconds >= SECONDS_PER_MINUTE;
  const value = useMinutes ? Math.ceil(totalSeconds / SECONDS_PER_MINUTE) : Math.max(1, Math.ceil(totalSeconds));
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: useMinutes ? "minute" : "second",
    unitDisplay: "long",
  }).format(value);
}
