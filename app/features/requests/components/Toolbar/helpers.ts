import type { ImportProviderState } from "./types";

export function deriveSpotifyState(
  configured: boolean,
  connected: boolean,
  pending: boolean
): ImportProviderState {
  if (!configured) return "not_configured";
  if (pending) return "pending";
  if (!connected) return "not_connected";
  return "ready";
}

export function tooltipForState(state: ImportProviderState, isAdmin: boolean): string {
  switch (state) {
    case "not_configured":
      return isAdmin
        ? "Spotify isn't configured yet. Configure it in Settings → Integrations → Spotify."
        : "Spotify isn't configured. Ask an admin to set it up in Settings.";
    case "not_connected":
      return "Connect your Spotify account first from Settings → Integrations → Spotify.";
    case "pending":
      return "Spotify is still authorizing your library. Try again in a few minutes.";
    case "ready":
      return "Browse and import your Spotify library";
  }
}
