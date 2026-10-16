import type { inferRouterOutputs } from "@trpc/server";
import type { ParseKeys } from "i18next";
import type { LucideIcon } from "lucide-react";

import type { AppRouter } from "@api/__generated__/types";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type MaintenanceCounts = RouterOutputs["maintenance"]["counts"];

export type SystemProblem = RouterOutputs["maintenance"]["systemStatus"]["problems"][number];

export type JobSummary = RouterOutputs["jobs"]["list"][number];

export interface NextRunParts {
  value: string;
  unit?: string;
}

export type DownloadSourcesConfig = RouterOutputs["settings"]["get"]["downloadSources"];

export type DownloadSourcesAvailability = RouterOutputs["settings"]["downloadSourcesAvailability"];

export type ServerConnections = Pick<
  RouterOutputs["settings"]["get"]["connections"],
  "plex" | "navidrome" | "jellyfin"
>;

export type SlskdHealth = "healthy" | "unhealthy" | "not_configured";

export type LidarrHealth = SlskdHealth;

export interface EngineImportSettings {
  metadataConfidenceThreshold: number;
  acoustidIdentityGate: boolean;
}

export type SettingsPageGroup = "you" | "server" | "about";

export type SettingsPageId =
  | "account"
  | "appearance"
  | "connectedAccounts"
  | "listening"
  | "notifications"
  | "apps"
  | "overview"
  | "members"
  | "downloadSources"
  | "engine"
  | "library"
  | "media"
  | "metadata"
  | "maintenance"
  | "system"
  | "about";

export type SettingsBadgeKey = "problems" | "maintenance";

export interface SettingsPage {
  id: SettingsPageId;
  group: SettingsPageGroup;
  href: string;
  labelKey: ParseKeys<"settings">;
  descriptionKey: ParseKeys<"settings">;
  icon: LucideIcon;
  badge?: SettingsBadgeKey;
}

export type SettingsTabbedPageId = "library" | "maintenance" | "system";

export interface SettingsTab {
  href: string;
  labelKey: ParseKeys<"settings">;
  icon: LucideIcon;
  countKey?: keyof MaintenanceCounts;
}

export interface SettingsSearchEntry {
  labelKey: ParseKeys<"settings">;
  page: SettingsPageId;
  href: string;
  anchor?: string;
  placeKey?: ParseKeys<"settings">;
  keywordsKey?: ParseKeys<"settings">;
  adminOnly?: boolean;
}

export interface SettingsSearchResult {
  entry: SettingsSearchEntry;
  label: string;
  place: string;
}

export type SettingsPaletteActionId =
  | "runLibraryScan"
  | "checkForUpdates"
  | "reviewUnidentified"
  | "createLocalUser"
  | "addLibraryPath"
  | "newApiKey"
  | "emptyRecycleBin"
  | "resolveDuplicates"
  | "downloadLogs";

export interface SettingsShortcutHandlers {
  onPalette: () => void;
  onSearch: () => void;
}

export interface SettingsPaletteAction {
  id: SettingsPaletteActionId;
  labelKey: ParseKeys<"settings">;
  page: SettingsPageId;
  href: string;
}
