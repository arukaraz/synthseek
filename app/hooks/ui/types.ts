export type SetupRedirectContext = "app" | "login" | "setup";

export type SetupGate = { status: "resolving" } | { status: "error" } | { status: "redirecting" } | { status: "ready" };

export type PlexPinPhase = "idle" | "pending" | "completed" | "error";

export interface PlexPinStart {
  pinId: string;
  authUrl: string;
}

export interface UsePlexPinPopupOptions<TResolved> {
  start: () => Promise<PlexPinStart>;
  poll: (pinId: string) => Promise<TResolved | null>;
  onResolved: (resolved: TResolved) => void;
  popupBlockedMessage?: string;
  timeoutMessage?: string;
  errorFallbackMessage?: string;
}

export interface UsePlexPinPopupResult {
  start: () => Promise<void>;
  reset: () => void;
  phase: PlexPinPhase;
  isPending: boolean;
}
