import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";
import i18n from "@locale";
import { PLAYBACK_SERVER_NAMES } from "@utils/playback-servers";

import type { ChainStatus } from "../../components/OrderedChain";
import { PLAYBACK_SERVER_KEYS, SOURCE_TITLE_KEYS } from "../../constants";
import {
  lidarrChainStatus,
  serverChainStatus,
  serverConnections,
  sourceChainStatus,
  sourceOrderOf,
} from "../../helpers";
import type { DownloadSourcesAvailability, JobSummary, LidarrHealth, SlskdHealth } from "../../types";
import type { ConnectionRowView, SetupCheck } from "./types";

type SettingsView = inferRouterOutputs<AppRouter>["settings"]["get"];

function spotifyStatus(settings: SettingsView): ChainStatus {
  const spotify = settings.connections.spotify;
  if (!spotify.enabled) return { tone: "muted", label: i18n.t("settings:shell.sourceStatus.off") };
  return spotify.clientId && spotify.publicBaseUrl
    ? { tone: "success", label: i18n.t("settings:shell.sourceStatus.on") }
    : { tone: "warning", label: i18n.t("settings:overview.connections.missingDetails") };
}

export function connectionRows(
  settings: SettingsView,
  availability: DownloadSourcesAvailability | undefined,
  slskd: SlskdHealth | undefined,
  lidarr: LidarrHealth | undefined
): ConnectionRowView[] {
  const sources = sourceOrderOf(settings.downloadSources).map((key, index) => ({
    id: key,
    name: i18n.t(`settings:${SOURCE_TITLE_KEYS[key]}`),
    role: i18n.t("settings:overview.connections.downloadSource", { position: index + 1 }),
    status: sourceChainStatus(key, settings.downloadSources, availability, slskd),
    href: `/settings/download-sources?source=${key}`,
  }));
  const connected = serverConnections(settings.connections);
  const servers = PLAYBACK_SERVER_KEYS.map((server) => ({
    id: server,
    name: PLAYBACK_SERVER_NAMES[server],
    role: i18n.t("settings:overview.connections.mediaServer"),
    status: serverChainStatus(connected[server]),
    href: `/settings/media?server=${server}`,
  }));
  return [
    ...sources,
    {
      id: "lidarr",
      name: i18n.t("settings:lidarr.title"),
      role: i18n.t("settings:overview.connections.handOff"),
      status: lidarrChainStatus(lidarr),
      href: "/settings/download-sources?source=lidarr",
    },
    ...servers,
    {
      id: "spotify",
      name: i18n.t("settings:metadata.librarySources.spotify.title"),
      role: i18n.t("settings:overview.connections.librarySource"),
      status: spotifyStatus(settings),
      href: "/settings/library/sources",
    },
  ];
}

export function jobsAtAGlance(jobs: readonly JobSummary[], limit: number): JobSummary[] {
  const rank = (job: JobSummary) => (job.running ? 0 : job.lastStatus === "failed" ? 1 : 2);
  const nextRunOf = (job: JobSummary) => (job.nextRun ? new Date(job.nextRun).getTime() : Number.POSITIVE_INFINITY);
  return jobs
    .filter((job) => job.enabled && job.listed)
    .sort((left, right) => rank(left) - rank(right) || nextRunOf(left) - nextRunOf(right))
    .slice(0, limit);
}

export function setupChecks(
  settings: SettingsView,
  availability: DownloadSourcesAvailability | undefined
): SetupCheck[] {
  const enrichment = settings.connections.enrichment;
  const connected = serverConnections(settings.connections);
  return [
    {
      id: "source",
      labelKey: "overview.setup.downloadSource",
      done: availability !== undefined && Object.values(availability).some((source) => source.enabled),
      href: "/settings/download-sources",
    },
    {
      id: "mediaServer",
      labelKey: "overview.setup.mediaServer",
      done: Object.values(connected).some(Boolean),
      href: "/settings/media",
    },
    {
      id: "musicbrainz",
      labelKey: "overview.setup.musicbrainzEmail",
      done: enrichment.musicbrainzEmail.trim().length > 0,
      href: "/settings/metadata#connections.enrichment.musicbrainzEmail",
    },
    {
      id: "acoustid",
      labelKey: "overview.setup.acoustidKey",
      done: enrichment.acoustidApiKey.length > 0,
      href: "/settings/metadata#connections.enrichment.acoustidApiKey",
    },
  ];
}
