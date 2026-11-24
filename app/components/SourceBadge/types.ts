export type BadgeSource =
  | "lastfm"
  | "listenbrainz"
  | "catalog"
  | "wikipedia"
  | "mediaServer"
  | "plex"
  | "jellyfin"
  | "navidrome"
  | "lidarr"
  | "bandsintown";

export type NamedSource = Exclude<BadgeSource, "catalog" | "mediaServer">;

export interface SourceBadgeProps {
  source: BadgeSource;
  label: string;
}
