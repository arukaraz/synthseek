import { codedErrorOf, type CodedError } from "@modules/errors";

import type { BrowserLocation } from "./returnPath";

export const CALLBACK_ERROR_PARAM = "error";
export const CALLBACK_RETRY_AFTER_PARAM = "retryAfterSeconds";
export const CALLBACK_LINKED_PARAM = "linked";
export const CALLBACK_LINKED_OIDC = "oidc";

const CALLBACK_PARAMS: readonly string[] = [CALLBACK_ERROR_PARAM, CALLBACK_RETRY_AFTER_PARAM, CALLBACK_LINKED_PARAM];

export const CALLBACK_ERROR_CODES: readonly string[] = [
  "OIDC_NOT_AVAILABLE",
  "OIDC_SIGN_IN_EXPIRED",
  "OIDC_USER_NOT_LINKED",
  "OIDC_ALREADY_LINKED",
  "OIDC_LINK_SESSION_MISMATCH",
  "OIDC_PROVIDER_REFUSED",
  "OIDC_PROVIDER_UNREACHABLE",
  "OIDC_SIGN_IN_FAILED",
  "ACCOUNT_PENDING_APPROVAL",
  "ACCOUNT_EMAIL_IN_USE",
  "TOO_MANY_LOGIN_ATTEMPTS",
];

function retryAfterOf(raw: string | null): Record<string, number> {
  if (raw === null) return {};
  const seconds = Number(raw);
  return Number.isFinite(seconds) && seconds > 0 ? { retryAfterSeconds: Math.ceil(seconds) } : {};
}

export function callbackErrorOf(search: string): CodedError | null {
  const query = new URLSearchParams(search);
  const code = query.get(CALLBACK_ERROR_PARAM);
  if (code === null || !CALLBACK_ERROR_CODES.includes(code)) return null;
  return codedErrorOf({ data: { appCode: code, appParams: retryAfterOf(query.get(CALLBACK_RETRY_AFTER_PARAM)) } });
}

export function linkedAtProvider(search: string): boolean {
  return new URLSearchParams(search).get(CALLBACK_LINKED_PARAM) === CALLBACK_LINKED_OIDC;
}

export function hrefWithoutCallbackParams(location: BrowserLocation): string | null {
  const query = new URLSearchParams(location.search);
  if (!CALLBACK_PARAMS.some((name) => query.has(name))) return null;
  for (const name of CALLBACK_PARAMS) query.delete(name);
  const rest = query.toString();
  return `${location.pathname}${rest ? `?${rest}` : ""}${location.hash}`;
}
