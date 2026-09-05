import type { AppRouter, PublicUser } from "@api/__generated__/types";
import type { inferRouterOutputs } from "@trpc/server";

export interface ProfileCardProps {
  user: PublicUser;
}

export interface PlexMarkProps {
  size?: number;
}

export type ListeningConnectionView = inferRouterOutputs<AppRouter>["playback"]["scrobble"]["connections"][number];

export type ListeningService = ListeningConnectionView["service"];

export interface ListeningServiceRowProps {
  connection: ListeningConnectionView;
  seenClients: string[];
}
