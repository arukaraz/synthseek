import type { inferRouterOutputs } from "@trpc/server";
import type { ParseKeys } from "i18next";

import type { AppRouter } from "@api/__generated__/types";
import type { PlaybackServerKey } from "@utils/playback-servers";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type ConnectionsEnrichment = {
  lastfmApiKey: string;
  lastfmApiSecret: string;
  fanartApiKey: string;
  songlinkApiKey: string;
  acoustidApiKey: string;
  musicbrainzEmail: string;
  discogsToken: string;
};

export interface ConnectionsSpotify {
  enabled: boolean;
  clientId: string;
  publicBaseUrl: string;
}

export type Affix = "off" | "prefix" | "suffix";

export interface PlexIntegrationCardProps {
  initial: {
    connection: { url: string; token: string };
    behavior: { libraryScan: boolean; playlistSync: boolean };
    naming: { plexPlaylistUsernameAffix: Affix; plexPlaylistUsernameSeparator: string };
  };
}

export interface SlskdEngineSearch {
  maxPeerAttempts: number;
  maxVariations: number;
  historyCleanupEnabled: boolean;
  maxHistorySearches: number;
  banAfterFailedAttempts: number;
  strictTierOrdering: boolean;
}

export interface EngineTimeouts {
  searchPhase: number;
  downloadPhase: number;
  importPhase: number;
  peerUnresponsive: number;
  queueWaitActivePeer: number;
  queueWaitIdlePeer: number;
}

export interface SlskdCardProps {
  initial: {
    connection: { apiUrl: string; apiKey: string; bannedUsers: string[] };
    search: SlskdEngineSearch;
    timeouts: EngineTimeouts;
  };
}

export type SlskdHealth = "healthy" | "unhealthy" | "not_configured";

export type SlskdStatusTone = "success" | "danger" | "muted";

export interface SlskdStatusBadgeProps {
  status: SlskdHealth;
  message?: string;
  messageCode?: ParseKeys<"health">;
  messageParams?: Record<string, string>;
}

export interface LidarrCardProps {
  initial: { url: string; apiKey: string };
}

export type LidarrHealth = SlskdHealth;

export type LidarrStatusTone = SlskdStatusTone;

export interface LidarrStatusBadgeProps {
  status: LidarrHealth;
  message?: string;
  messageCode?: ParseKeys<"health">;
  messageParams?: Record<string, string>;
}

export interface EnrichmentCardProps {
  initial: ConnectionsEnrichment;
}

export type DownloadSourcesConfig = RouterOutputs["settings"]["get"]["downloadSources"];

export interface YtdlpCardProps {
  initial: DownloadSourcesConfig;
}

export interface UsenetCardProps {
  initial: DownloadSourcesConfig;
}

export interface ArchiveCardProps {
  initial: DownloadSourcesConfig;
}

export interface SoundcloudCardProps {
  initial: DownloadSourcesConfig;
}

type RemoteMediaSearchField = "searchResults" | "maxDurationDeltaSec" | "searchTimeout";

export interface RemoteMediaSearchRowsProps {
  section: "ytdlp" | "soundcloud";
  values: Pick<DownloadSourcesConfig["soundcloud"], RemoteMediaSearchField>;
  onFieldChange: (field: RemoteMediaSearchField, value: number) => void;
}

export interface SpotifySourceCardProps {
  spotify: ConnectionsSpotify;
}

export interface StagedReleaseListProps {
  enabled: boolean;
}

export type ServerTestOutcome = "ok" | "unauthorized" | "failed";

interface NavidromeConnection {
  url: string;
  username: string;
  password: string;
  playlistSync: boolean;
}

interface JellyfinConnection {
  url: string;
  apiKey: string;
  playlistSync: boolean;
}

export interface MediaServerPlaylistSyncRowProps {
  server: string;
  connected: boolean;
  playlistSync: boolean;
  onChange: (value: boolean) => void;
}

export interface NavidromeCardProps {
  initial: NavidromeConnection;
}

export interface JellyfinCardProps {
  initial: JellyfinConnection;
}

export interface PlaybackOrderCardProps {
  order: readonly PlaybackServerKey[];
  connected: Readonly<Record<PlaybackServerKey, boolean>>;
}
