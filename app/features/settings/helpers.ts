import { DownloadSourceKey } from "@api/__generated__/types";
import i18n from "@locale";
import type { PlaybackServerKey } from "@utils/playback-servers";

import type { ChainStatus } from "./components/OrderedChain";
import { DAY_MS, HOUR_MS, MINUTE_MS, SETTINGS_HOME_BY_ROLE, SETTINGS_PAGES, SETTINGS_ROOT } from "./constants";
import type {
  DownloadSourcesAvailability,
  DownloadSourcesConfig,
  LidarrHealth,
  NextRunParts,
  ServerConnections,
  SettingsPage,
  SlskdHealth,
  SystemProblem,
} from "./types";

export function isPathWithin(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isSettingsPath(pathname: string): boolean {
  return isPathWithin(pathname, SETTINGS_ROOT);
}

export function settingsPageAt(pathname: string): SettingsPage | undefined {
  return SETTINGS_PAGES.find((page) => isPathWithin(pathname, page.href));
}

export function isAdminOnlySettingsPath(pathname: string): boolean {
  return settingsPageAt(pathname)?.group === "server";
}

export function settingsHomeFor(isAdmin: boolean): string {
  return isAdmin ? SETTINGS_HOME_BY_ROLE.admin : SETTINGS_HOME_BY_ROLE.member;
}

export function describeInterval(intervalMs: number): string {
  if (intervalMs < HOUR_MS) {
    const minutes = Math.round(intervalMs / MINUTE_MS);
    return minutes <= 1
      ? i18n.t("settings:jobs.interval.everyMinute")
      : i18n.t("settings:jobs.interval.everyMinutes", { count: minutes });
  }

  if (intervalMs < DAY_MS) {
    const hours = Math.round(intervalMs / HOUR_MS);
    return hours <= 1
      ? i18n.t("settings:jobs.interval.everyHour")
      : i18n.t("settings:jobs.interval.everyHours", { count: hours });
  }

  const days = Math.round(intervalMs / DAY_MS);
  return days <= 1
    ? i18n.t("settings:jobs.interval.everyDay")
    : i18n.t("settings:jobs.interval.everyDays", { count: days });
}

export function formatNextRun(date: Date | null, now: number): NextRunParts {
  if (!date) return { value: i18n.t("settings:jobs.row.nextRunFallback") };

  const diffMs = date.getTime() - now;
  if (diffMs <= 0) return { value: i18n.t("settings:jobs.nextRun.now") };

  const seconds = Math.round(diffMs / 1000);
  if (seconds < 60) return { value: String(seconds), unit: "s" };

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return { value: String(minutes), unit: "min" };

  const hours = Math.round(minutes / 60);
  if (hours < 24) return { value: String(hours), unit: "h" };

  const days = Math.round(hours / 24);
  return { value: String(days), unit: "d" };
}

export function sourceOrderOf(config: DownloadSourcesConfig): DownloadSourceKey[] {
  return [...DownloadSourceKey.options].sort((left, right) => config[left].priority - config[right].priority);
}

export function sourceChainStatus(
  key: DownloadSourceKey,
  config: DownloadSourcesConfig,
  availability: DownloadSourcesAvailability | undefined,
  slskdHealth: SlskdHealth | undefined
): ChainStatus {
  if (!config[key].enabled) return { tone: "muted", label: i18n.t("settings:shell.sourceStatus.off") };
  if (availability === undefined) return { tone: "muted", label: i18n.t("settings:shell.sourceStatus.checking") };
  if (!availability[key].enabled) {
    const collections = config.archive.collections;
    return key === "archive" && !collections.netlabels && !collections.etree && !collections.community
      ? { tone: "warning", label: i18n.t("settings:shell.sourceStatus.noCollection") }
      : { tone: "muted", label: i18n.t("settings:shell.sourceStatus.notConfigured") };
  }
  if (key === "slskd" && slskdHealth === "unhealthy") {
    return { tone: "danger", label: i18n.t("settings:slskd.status.unhealthy") };
  }
  if (key === "slskd" && slskdHealth === "healthy") {
    return { tone: "success", label: i18n.t("settings:slskd.status.healthy") };
  }
  return { tone: "success", label: i18n.t("settings:shell.sourceStatus.on") };
}

export function serverConnections(connections: ServerConnections): Record<PlaybackServerKey, boolean> {
  const { plex, navidrome, jellyfin } = connections;
  return {
    plex: Boolean(plex.url && plex.token),
    navidrome: Boolean(navidrome.url && navidrome.username && navidrome.password),
    jellyfin: Boolean(jellyfin.url && jellyfin.apiKey),
  };
}

export function serverChainStatus(connected: boolean): ChainStatus {
  return connected
    ? { tone: "success", label: i18n.t("settings:mediaServers.order.connected") }
    : { tone: "muted", label: i18n.t("settings:mediaServers.order.notConnected") };
}

export function lidarrChainStatus(health: LidarrHealth | undefined): ChainStatus {
  if (health === "healthy") return { tone: "success", label: i18n.t("settings:lidarr.status.healthy") };
  if (health === "unhealthy") return { tone: "danger", label: i18n.t("settings:lidarr.status.unhealthy") };
  return { tone: "muted", label: i18n.t("settings:lidarr.status.notConfigured") };
}

export function problemKey(problem: SystemProblem): string {
  return JSON.stringify(problem);
}
