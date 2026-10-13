import type { ParseKeys } from "i18next";

import type {
  Affix,
  LidarrHealth,
  LidarrStatusTone,
  ServerTestOutcome,
  SlskdHealth,
  SlskdStatusTone,
  SubsonicSourceTestOutcome,
  TorrentClientOutcome,
  TorrentIndexerOutcome,
  TorrentTestWarning,
} from "./types";

export const TORRENT_INDEXER_TEST_KEYS: Readonly<Record<TorrentIndexerOutcome, ParseKeys<"settings">>> = {
  ok: "torrent.test.ok",
  failed: "torrent.test.indexer.failed",
  incomplete: "torrent.test.indexer.incomplete",
};

export const TORRENT_CLIENT_TEST_KEYS: Readonly<Record<TorrentClientOutcome, ParseKeys<"settings">>> = {
  ok: "torrent.test.ok",
  bad_credentials: "torrent.test.client.bad_credentials",
  host_rejected: "torrent.test.client.host_rejected",
  banned: "torrent.test.client.banned",
  unreachable: "torrent.test.client.unreachable",
  too_old: "torrent.test.client.too_old",
  incomplete: "torrent.test.client.incomplete",
};

export const TORRENT_TEST_WARNING_KEYS: Readonly<Record<TorrentTestWarning, ParseKeys<"settings">>> = {
  removes_on_share_limit: "torrent.test.warning.removes_on_share_limit",
  dht_off: "torrent.test.warning.dht_off",
};

export const DOWNLOADED_ALBUMS_HREF = "/settings/maintenance/downloaded-albums";

export const SUBSONIC_SOURCE_TEST_KEYS: Readonly<Record<SubsonicSourceTestOutcome, ParseKeys<"settings">>> = {
  ok: "subsonicSource.test.ok",
  unauthorized: "subsonicSource.test.unauthorized",
  unreachable: "subsonicSource.test.unreachable",
  self: "subsonicSource.test.self",
  incomplete: "subsonicSource.test.incomplete",
};

export const SERVER_TEST_OUTCOME_KEYS: Readonly<Record<ServerTestOutcome, ParseKeys<"settings">>> = {
  ok: "mediaServers.test.ok",
  unauthorized: "mediaServers.test.unauthorized",
  failed: "mediaServers.test.failed",
};

export const MS = 1000;

export const AFFIX_VALUES: ReadonlyArray<Affix> = ["off", "prefix", "suffix"];

export const SLSKD_STATUS_TONE: Record<SlskdHealth, SlskdStatusTone> = {
  healthy: "success",
  unhealthy: "danger",
  not_configured: "muted",
};

export const LIDARR_STATUS_TONE: Record<LidarrHealth, LidarrStatusTone> = {
  healthy: "success",
  unhealthy: "danger",
  not_configured: "muted",
};
