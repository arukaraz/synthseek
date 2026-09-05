import type { ParseKeys } from "i18next";

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

export interface DownloadSourceSlskd {
  enabled: boolean;
  priority: number;
}

export interface DownloadSourceYtdlp {
  enabled: boolean;
  priority: number;
  searchResults: number;
  maxDurationDeltaSec: number;
  searchTimeout: number;
}

export interface DownloadSourceUsenet {
  enabled: boolean;
  priority: number;
  indexerUrl: string;
  indexerApiKey: string;
  sabnzbdUrl: string;
  sabnzbdApiKey: string;
  maxSizeMb: number;
  minAgeHours: number;
  searchTimeout: number;
  singleTrackRequests: boolean;
  stagingRetentionHours: number;
}

export interface DownloadSourcesConfig {
  slskd: DownloadSourceSlskd;
  ytdlp: DownloadSourceYtdlp;
  usenet: DownloadSourceUsenet;
}

export interface YtdlpCardProps {
  initial: DownloadSourcesConfig;
}

export interface UsenetCardProps {
  initial: DownloadSourcesConfig;
}

export interface LibrarySourcesCardProps {
  spotify: ConnectionsSpotify;
  enrichment: ConnectionsEnrichment;
}

export interface StagedReleaseListProps {
  enabled: boolean;
}
