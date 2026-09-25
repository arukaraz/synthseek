import type { AppRouter, PublicUser } from "@api/__generated__/types";
import type { inferRouterOutputs } from "@trpc/server";

export interface ProfileCardProps {
  user: PublicUser;
}

export interface PlexMarkProps {
  size?: number;
}

export interface PlexReportingRowProps {
  onRelink: () => void;
  relinking: boolean;
}

type SourceAccountView = inferRouterOutputs<AppRouter>["playback"]["sources"]["accounts"][number];

export type SourceLinkOutcome = inferRouterOutputs<AppRouter>["playback"]["sources"]["link"]["outcome"];

export interface ServerAccountRowProps {
  account: SourceAccountView;
}

export type ListeningConnectionView = inferRouterOutputs<AppRouter>["playback"]["scrobble"]["connections"][number];

export type ListeningService = ListeningConnectionView["service"];

export interface ListeningServiceRowProps {
  connection: ListeningConnectionView;
  seenClients: string[];
}
