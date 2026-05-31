import type { ErrorCategory, ErrorEntry, FriendlyError } from "./types";

export const ERROR_REGISTRY: Record<ErrorCategory, Record<string, ErrorEntry>> = {
  spotify: {
    premium_propagation: {
      title: "Spotify is rejecting API calls for the app owner",
      description:
        "Spotify requires the app owner's account to have an active Premium subscription. If Premium was just enabled, changes can take a few hours to propagate. Synthseek will keep your tokens and retry automatically.",
      duration: 12000,
      severity: "warning",
      matches: [/Active premium subscription required for the owner/i],
    },
    not_configured: {
      title: "Spotify is not configured",
      description: "Ask your administrator to set the Client ID and Public Base URL in Settings.",
      severity: "warning",
      matches: [/Spotify is not configured/i, /not configured by the admin/i],
    },
    state_expired: {
      title: "Authorization link expired",
      description: "The OAuth state expired before you finished the handshake. Click Connect Spotify again.",
      severity: "warning",
      matches: [/state expired/i],
    },
    session_expired: {
      title: "Synthseek session expired",
      description: "Log in again, then retry connecting Spotify.",
      severity: "error",
      matches: [/UNAUTHORIZED/i, /Authentication required/i],
    },
    exchange_failed: {
      title: "Spotify connection failed",
      description: "Synthseek couldn't complete the OAuth exchange. Check the server logs and retry.",
      severity: "error",
    },
    proxy_error: {
      title: "Couldn't reach Synthseek backend",
      description: "The callback couldn't talk to the API. Check that the backend is running and try again.",
      severity: "error",
    },
    missing_params: {
      title: "Spotify didn't return an authorization code",
      description: "Try again. If it keeps happening, check the Redirect URI in your Spotify App settings.",
      severity: "warning",
    },
    access_denied: {
      title: "You declined the Spotify authorization",
      description: "Click Connect Spotify again whenever you're ready.",
      severity: "warning",
    },
    connected: {
      title: "Spotify connected",
      description: "Open Import from providers to start importing your library.",
      severity: "success",
    },
  },
  generic: {
    network: {
      title: "Network error",
      description: "Couldn't reach the server. Check your connection and try again.",
      severity: "error",
      matches: [/fetch failed/i, /network/i, /ECONNREFUSED/i],
    },
    unauthorized: {
      title: "You're signed out",
      description: "Please log in again.",
      severity: "warning",
      matches: [/UNAUTHORIZED/i, /Authentication required/i],
    },
    forbidden: {
      title: "Not allowed",
      description: "You don't have permission for that action.",
      severity: "error",
      matches: [/FORBIDDEN/i],
    },
  },
};

export function resolveById(category: ErrorCategory, id: string): FriendlyError | null {
  const entry = ERROR_REGISTRY[category]?.[id];
  if (!entry) return null;
  return { title: entry.title, description: entry.description, severity: entry.severity, duration: entry.duration };
}

export function resolveByMessage(message: string, preferredCategory?: ErrorCategory): FriendlyError | null {
  if (!message) return null;
  const categories: ErrorCategory[] = preferredCategory
    ? [preferredCategory, ...(Object.keys(ERROR_REGISTRY) as ErrorCategory[]).filter((c) => c !== preferredCategory)]
    : (Object.keys(ERROR_REGISTRY) as ErrorCategory[]);
  for (const category of categories) {
    const bucket = ERROR_REGISTRY[category];
    for (const entry of Object.values(bucket)) {
      if (entry.matches?.some((re) => re.test(message))) {
        return {
          title: entry.title,
          description: entry.description,
          severity: entry.severity,
          duration: entry.duration,
        };
      }
    }
  }
  return null;
}
