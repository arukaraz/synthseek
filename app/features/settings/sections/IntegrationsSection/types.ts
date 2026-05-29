export type ConnectionsEnrichment = {
  lastfmApiKey: string;
  fanartApiKey: string;
  songlinkApiKey: string;
  acoustidApiKey: string;
  musicbrainzEmail: string;
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

export interface SlskdCardProps {
  initial: { apiUrl: string; apiKey: string; bannedUsers: string[] };
}

export interface EnrichmentCardProps {
  initial: ConnectionsEnrichment;
}

export interface LibrarySourcesCardProps {
  spotify: ConnectionsSpotify;
  enrichment: ConnectionsEnrichment;
}
