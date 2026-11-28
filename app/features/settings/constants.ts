import {
  Accessibility,
  Activity,
  ArrowUpCircle,
  AudioLines,
  Bell,
  CalendarDays,
  CopyCheck,
  Download,
  FileText,
  FolderTree,
  HardDrive,
  Import,
  Inbox,
  KeyRound,
  LayoutGrid,
  Library,
  Link2,
  LayoutDashboard,
  ListOrdered,
  Palette,
  Plug,
  ScanSearch,
  Shield,
  ShieldBan,
  Tags,
  Timer,
  Trash2,
  User,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import type { ParseKeys } from "i18next";

import type { DownloadSourceKey } from "@api/__generated__/types";
import { isPlaybackServerKey, PLAYBACK_SERVER_NAMES, type PlaybackServerKey } from "@utils/playback-servers";

import type { JobSummary, SettingsPage, SettingsPageId, SettingsTab, SettingsTabbedPageId } from "./types";

export const SETTINGS_ROOT = "/settings";

export const SETTINGS_PAGE_BY_ID = {
  account: {
    id: "account",
    group: "you",
    href: "/settings/account",
    labelKey: "shell.pages.account.title",
    descriptionKey: "shell.pages.account.description",
    icon: User,
  },
  privacy: {
    id: "privacy",
    group: "you",
    href: "/settings/privacy",
    labelKey: "shell.pages.privacy.title",
    descriptionKey: "shell.pages.privacy.description",
    icon: Shield,
  },
  customization: {
    id: "customization",
    group: "you",
    href: "/settings/customization",
    labelKey: "shell.pages.customization.title",
    descriptionKey: "shell.pages.customization.description",
    icon: Palette,
  },
  playback: {
    id: "playback",
    group: "you",
    href: "/settings/playback",
    labelKey: "shell.pages.playback.title",
    descriptionKey: "shell.pages.playback.description",
    icon: AudioLines,
  },
  accessibility: {
    id: "accessibility",
    group: "you",
    href: "/settings/accessibility",
    labelKey: "shell.pages.accessibility.title",
    descriptionKey: "shell.pages.accessibility.description",
    icon: Accessibility,
  },
  connections: {
    id: "connections",
    group: "you",
    href: "/settings/connections",
    labelKey: "shell.pages.connections.title",
    descriptionKey: "shell.pages.connections.description",
    icon: Plug,
  },
  notifications: {
    id: "notifications",
    group: "you",
    href: "/settings/notifications",
    labelKey: "shell.pages.notifications.title",
    descriptionKey: "notifications.pageDescription",
    icon: Bell,
  },
  releases: {
    id: "releases",
    group: "you",
    href: "/settings/releases",
    labelKey: "shell.pages.releases.title",
    descriptionKey: "shell.pages.releases.description",
    icon: CalendarDays,
  },
  overview: {
    id: "overview",
    group: "server",
    href: "/settings/overview",
    labelKey: "shell.pages.overview.title",
    descriptionKey: "shell.pages.overview.description",
    icon: LayoutGrid,
    badge: "problems",
  },
  members: {
    id: "members",
    group: "server",
    href: "/settings/members",
    labelKey: "shell.pages.members.title",
    descriptionKey: "shell.pages.members.description",
    icon: Users,
  },
  download: {
    id: "download",
    group: "server",
    href: "/settings/download",
    labelKey: "shell.pages.download.title",
    descriptionKey: "shell.pages.download.description",
    icon: Download,
  },
  library: {
    id: "library",
    group: "server",
    href: "/settings/library",
    labelKey: "shell.pages.library.title",
    descriptionKey: "library.page.description",
    icon: Library,
  },
  metadata: {
    id: "metadata",
    group: "server",
    href: "/settings/metadata",
    labelKey: "shell.pages.metadata.title",
    descriptionKey: "shell.pages.metadata.description",
    icon: Tags,
  },
  maintenance: {
    id: "maintenance",
    group: "server",
    href: "/settings/maintenance",
    labelKey: "shell.pages.maintenance.title",
    descriptionKey: "shell.pages.maintenance.description",
    icon: Wrench,
    badge: "maintenance",
  },
  system: {
    id: "system",
    group: "server",
    href: "/settings/system",
    labelKey: "shell.pages.system.title",
    descriptionKey: "shell.pages.system.description",
    icon: Activity,
  },
  about: {
    id: "about",
    group: "about",
    href: "/settings/about",
    labelKey: "shell.pages.about.title",
    descriptionKey: "updates.page.description",
    icon: ArrowUpCircle,
  },
} satisfies Readonly<Record<SettingsPageId, SettingsPage>>;

export const SETTINGS_PAGES: readonly SettingsPage[] = Object.values(SETTINGS_PAGE_BY_ID);

export const YOU_PAGES: readonly SettingsPage[] = SETTINGS_PAGES.filter((page) => page.group === "you");

export const SERVER_PAGES: readonly SettingsPage[] = SETTINGS_PAGES.filter((page) => page.group === "server");

export const APPS_TAB_HREF = "/settings/connections/apps";

export const AI_ASSISTANTS_ANCHOR = "ai-assistants";

export const SETTINGS_TABS: Readonly<Record<SettingsTabbedPageId, readonly SettingsTab[]>> = {
  customization: [
    { href: "/settings/customization/theme", labelKey: "shell.tabs.customization.theme", icon: Palette },
    { href: "/settings/customization/board", labelKey: "shell.tabs.customization.board", icon: LayoutDashboard },
  ],
  connections: [
    { href: "/settings/connections/services", labelKey: "shell.tabs.connections.services", icon: Link2 },
    { href: APPS_TAB_HREF, labelKey: "shell.tabs.connections.apps", icon: KeyRound },
  ],
  download: [
    { href: "/settings/download/sources", labelKey: "shell.tabs.download.sources", icon: Download },
    { href: "/settings/download/engine", labelKey: "shell.tabs.download.engine", icon: ListOrdered },
  ],
  library: [
    { href: "/settings/library/sources", labelKey: "shell.tabs.library.sources", icon: Import },
    { href: "/settings/library/paths", labelKey: "shell.tabs.library.paths", icon: FolderTree },
    { href: "/settings/library/scan", labelKey: "shell.tabs.library.scan", icon: ScanSearch },
  ],
  releases: [
    { href: "/settings/releases/calendar", labelKey: "shell.tabs.releases.calendar", icon: CalendarDays },
    { href: "/settings/releases/following", labelKey: "shell.tabs.releases.following", icon: UserCheck },
  ],
  maintenance: [
    {
      href: "/settings/maintenance/review",
      labelKey: "shell.tabs.maintenance.review",
      icon: Inbox,
      countKey: "review",
    },
    {
      href: "/settings/maintenance/duplicates",
      labelKey: "shell.tabs.maintenance.duplicates",
      icon: CopyCheck,
      countKey: "duplicates",
    },
    {
      href: "/settings/maintenance/recycle-bin",
      labelKey: "shell.tabs.maintenance.recycleBin",
      icon: Trash2,
      countKey: "recycleBin",
    },
    {
      href: "/settings/maintenance/downloaded-albums",
      labelKey: "shell.tabs.maintenance.downloadedAlbums",
      icon: HardDrive,
      countKey: "downloadedAlbums",
    },
    {
      href: "/settings/maintenance/quarantine",
      labelKey: "shell.tabs.maintenance.quarantine",
      icon: ShieldBan,
      countKey: "quarantine",
    },
    {
      href: "/settings/maintenance/status",
      labelKey: "shell.tabs.maintenance.systemStatus",
      icon: Activity,
      countKey: "systemStatus",
    },
  ],
  system: [
    { href: "/settings/system/jobs", labelKey: "shell.tabs.system.jobs", icon: Timer },
    { href: "/settings/system/logs", labelKey: "shell.tabs.system.logs", icon: FileText },
  ],
};

export const MAINTENANCE_ATTENTION_KEYS = ["review", "duplicates", "recycleBin", "quarantine", "systemStatus"] as const;

export const SETTINGS_HOME_BY_ROLE = {
  admin: "/settings/overview",
  member: "/settings/account",
} as const;

export const BUILD_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";

export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

export const JOB_NAME_KEYS: Record<JobSummary["id"], ParseKeys<"settings">> = {
  "library-sync": "jobs.registry.library-sync.name",
  "discovery-sweep": "jobs.registry.discovery-sweep.name",
  "media-server-sync": "jobs.registry.media-server-sync.name",
  "wanted-sweep": "jobs.registry.wanted-sweep.name",
  "usenet-staging-sweep": "jobs.registry.usenet-staging-sweep.name",
  "library-scan": "jobs.registry.library-scan.name",
  "library-loudness": "jobs.registry.library-loudness.name",
  "audio-analysis": "jobs.registry.audio-analysis.name",
  "scrobble-relay": "jobs.registry.scrobble-relay.name",
  "playback-source-links": "jobs.registry.playback-source-links.name",
  "smart-playlists": "jobs.registry.smart-playlists.name",
  "release-watch": "jobs.registry.release-watch.name",
  "sign-in-background": "jobs.registry.sign-in-background.name",
};

export const JOB_DESCRIPTION_KEYS: Record<JobSummary["id"], ParseKeys<"settings">> = {
  "library-sync": "jobs.registry.library-sync.description",
  "discovery-sweep": "jobs.registry.discovery-sweep.description",
  "media-server-sync": "jobs.registry.media-server-sync.description",
  "wanted-sweep": "jobs.registry.wanted-sweep.description",
  "usenet-staging-sweep": "jobs.registry.usenet-staging-sweep.description",
  "library-scan": "jobs.registry.library-scan.description",
  "library-loudness": "jobs.registry.library-loudness.description",
  "audio-analysis": "jobs.registry.audio-analysis.description",
  "scrobble-relay": "jobs.registry.scrobble-relay.description",
  "playback-source-links": "jobs.registry.playback-source-links.description",
  "smart-playlists": "jobs.registry.smart-playlists.description",
  "release-watch": "jobs.registry.release-watch.description",
  "sign-in-background": "jobs.registry.sign-in-background.description",
};

export const SOURCE_TITLE_KEYS: Readonly<Record<DownloadSourceKey, ParseKeys<"settings">>> = {
  slskd: "slskd.title",
  ytdlp: "ytdlp.title",
  usenet: "usenet.title",
  archive: "archive.title",
  soundcloud: "soundcloud.title",
  subsonic: "subsonicSource.title",
  torrent: "torrent.title",
};

export const PLAYBACK_SERVER_KEYS: readonly PlaybackServerKey[] =
  Object.keys(PLAYBACK_SERVER_NAMES).filter(isPlaybackServerKey);

export const PANEL_REVEAL_VIEWPORT_SHARE = 0.5;
