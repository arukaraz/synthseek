export interface ArtworkCardProps {
  initial: {
    lastfmApiKey: string;
    fanartApiKey: string;
    songlinkApiKey: string;
    acoustidApiKey: string;
    musicbrainzEmail: string;
  };
}

export type EnrichmentSection = {
  lastfmApiKey: string;
  fanartApiKey: string;
  songlinkApiKey: string;
  acoustidApiKey: string;
  musicbrainzEmail: string;
};

export interface EnrichmentSingleFieldCardProps {
  initial: EnrichmentSection;
  field: keyof EnrichmentSection;
  title: string;
  optional?: boolean;
  description: string;
  fieldLabel: string;
  helper?: string;
  inputType?: "secret" | "email";
  placeholder?: string;
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
