import type { AppRouter, PublicUser } from "@api/__generated__/types";
import type { inferRouterOutputs } from "@trpc/server";
import type { ReactNode } from "react";

import type { SearchComboboxOption } from "@components/ui/SearchCombobox";

export interface ProfileCardProps {
  user: PublicUser;
}

export interface PlexReportingRowProps {
  onRelink: () => void;
  relinking: boolean;
}

export interface UnlinkPlexDialogProps {
  email: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SourceAccountView = inferRouterOutputs<AppRouter>["playback"]["sources"]["accounts"][number];

export type SourceLinkOutcome = inferRouterOutputs<AppRouter>["playback"]["sources"]["link"]["outcome"];

export interface ServerAccountRowProps {
  account: SourceAccountView;
}

export type ListeningConnectionView = inferRouterOutputs<AppRouter>["playback"]["scrobble"]["connections"][number];

export type ListeningService = ListeningConnectionView["service"];

export type QuotaUsageView = inferRouterOutputs<AppRouter>["requests"]["myQuota"];

export interface QuotaRowProps {
  label: string;
  value: string;
  note: string | null;
}

export interface VetoListProps {
  label: string;
  placeholder: string;
  entries: readonly { value: string; label: string }[];
  options: readonly SearchComboboxOption[];
  query: string;
  onQueryChange: (query: string) => void;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}

export interface ListeningServiceRowProps {
  connection: ListeningConnectionView;
  seenClients: string[];
  children?: ReactNode;
}
