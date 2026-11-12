import type { AppRouter, PublicUser } from "@api/__generated__/types";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type PrivacyOverview = RouterOutputs["privacy"]["overview"];

export type HistorySummary = PrivacyOverview["history"];

export type HistoryRange = inferRouterInputs<AppRouter>["privacy"]["clearHistory"]["range"];

export interface PrivacyCardProps {
  user: PublicUser;
}

export interface ClearHistoryDialogProps {
  open: boolean;
  history: HistorySummary;
  onClose: () => void;
}

export type LeavingStatus = "on" | "off" | "notConnected";

export type ListeningConnectionView = RouterOutputs["playback"]["scrobble"]["connections"][number];

export type SourceAccountView = RouterOutputs["playback"]["sources"]["accounts"][number];

export type ScrobbleService = ListeningConnectionView["service"];

export type LeavingRow =
  | { kind: "scrobble"; id: ScrobbleService; status: LeavingStatus }
  | { kind: "server"; id: SourceAccountView["server"]; status: LeavingStatus };
