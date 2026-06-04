import type { AppErrorCode } from "./appCode";
import type { ErrorCategory, ErrorSeverity } from "./types";

export const GENERIC_FALLBACK_CODE: AppErrorCode = "GENERIC_FALLBACK";

export interface ErrorMeta {
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  duration?: number;
  matchers?: ReadonlyArray<RegExp>;
  spotifyReason?: string;
}

/**
 * Single source of truth for per-code presentation metadata + the fallback
 * matchers for errors that arrive WITHOUT an appCode (the Spotify OAuth
 * callback carries a `?reason=`, network errors carry no code). Translatable
 * title/description live in messages/{locale}/errors.json keyed by the same
 * AppErrorCode. Spotify codes precede generic ones so a shared pattern (e.g.
 * UNAUTHORIZED) resolves to the spotify variant first.
 */
export const ERROR_META: Partial<Record<AppErrorCode, ErrorMeta>> = {
  SPOTIFY_PREMIUM_PROPAGATION: {
    category: "spotify",
    severity: "warning",
    duration: 12000,
    spotifyReason: "premium_propagation",
    matchers: [/Active premium subscription required for the owner/i],
  },
  SPOTIFY_NOT_CONFIGURED: {
    category: "spotify",
    severity: "warning",
    spotifyReason: "not_configured",
    matchers: [/Spotify is not configured/i, /not configured by the admin/i],
  },
  SPOTIFY_USER_NOT_REGISTERED: {
    category: "spotify",
    severity: "warning",
    duration: 12000,
    spotifyReason: "user_not_registered",
    matchers: [/not registered for this application/i, /user is not registered/i],
  },
  SPOTIFY_STATE_EXPIRED: {
    category: "spotify",
    severity: "warning",
    spotifyReason: "state_expired",
    matchers: [/state expired/i],
  },
  SPOTIFY_SESSION_EXPIRED: {
    category: "spotify",
    spotifyReason: "session_expired",
    matchers: [/UNAUTHORIZED/i, /Authentication required/i],
  },
  SPOTIFY_EXCHANGE_FAILED: { category: "spotify", spotifyReason: "exchange_failed" },
  SPOTIFY_PROXY_ERROR: { category: "spotify", spotifyReason: "proxy_error" },
  SPOTIFY_MISSING_PARAMS: { category: "spotify", severity: "warning", spotifyReason: "missing_params" },
  SPOTIFY_ACCESS_DENIED: { category: "spotify", severity: "warning", spotifyReason: "access_denied" },
  SPOTIFY_CONNECTED: { category: "spotify", severity: "success", spotifyReason: "connected" },
  NETWORK_ERROR: { category: "generic", severity: "error", matchers: [/fetch failed/i, /network/i, /ECONNREFUSED/i] },
  SIGNED_OUT: { category: "generic", severity: "warning", matchers: [/UNAUTHORIZED/i, /Authentication required/i] },
  FORBIDDEN: { category: "generic", matchers: [/FORBIDDEN/i] },
};

const ALL_CODES: ReadonlyArray<AppErrorCode> = Object.keys(ERROR_META).filter((code): code is AppErrorCode =>
  Object.prototype.hasOwnProperty.call(ERROR_META, code)
);

export function spotifyReasonToCode(reason: string): AppErrorCode | undefined {
  return ALL_CODES.find((code) => ERROR_META[code]?.spotifyReason === reason);
}

export function matchCode(message: string, preferredCategory?: ErrorCategory): AppErrorCode | undefined {
  if (!message) return undefined;
  const ordered = preferredCategory
    ? [
        ...ALL_CODES.filter((code) => ERROR_META[code]?.category === preferredCategory),
        ...ALL_CODES.filter((code) => ERROR_META[code]?.category !== preferredCategory),
      ]
    : ALL_CODES;
  return ordered.find((code) => ERROR_META[code]?.matchers?.some((pattern) => pattern.test(message)));
}
