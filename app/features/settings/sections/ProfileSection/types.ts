import type { AppRouter, PublicUser } from "@api/__generated__/types";
import type { inferRouterOutputs } from "@trpc/server";
import type { ReactNode } from "react";

import type { LibrarySourceDescription } from "@hooks/api/queries/library-source/types";
import type { Locale } from "@locale/config";
import type { FriendlyError } from "@modules/errors";

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

export interface SessionSourceRowProps {
  source: LibrarySourceDescription;
}

export type ListeningConnectionView = inferRouterOutputs<AppRouter>["playback"]["scrobble"]["connections"][number];

export type ListeningService = ListeningConnectionView["service"];

export type QuotaUsageView = inferRouterOutputs<AppRouter>["requests"]["myQuota"];

export interface QuotaRowProps {
  label: string;
  value: string;
  note: string | null;
}

export interface ListeningServiceRowProps {
  connection: ListeningConnectionView;
  seenClients: string[];
  children?: ReactNode;
}

export type SignInIdentitiesView = inferRouterOutputs<AppRouter>["auth"]["signInIdentities"];

export type SignInIdentityView = SignInIdentitiesView["identities"][number];

export interface WayInRowProps {
  name: string;
  status: string;
  children?: ReactNode;
}

export interface LinkJellyfinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface LinkCallbackOutcome {
  linked: boolean;
  failure: FriendlyError | null;
}

export interface LanguageSelectorProps {
  value: Locale;
  onSelect: (locale: Locale) => void;
  ariaLabel: string;
}
