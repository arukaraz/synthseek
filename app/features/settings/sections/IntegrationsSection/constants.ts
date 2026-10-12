import type { ParseKeys } from "i18next";

import type {
  Affix,
  LidarrHealth,
  LidarrStatusTone,
  ServerTestOutcome,
  SlskdHealth,
  SlskdStatusTone,
  StagedReleaseListKeys,
  StagedReleaseSource,
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

export const STAGED_LIST_KEYS: Readonly<Record<StagedReleaseSource, StagedReleaseListKeys>> = {
  usenet: {
    title: "usenet.stagedList.title",
    emptyTitle: "usenet.stagedList.empty.title",
    emptyDescription: "usenet.stagedList.empty.description",
    loading: "usenet.stagedList.loading",
    loadError: "usenet.stagedList.loadError",
    clearAll: "usenet.stagedList.clearAll",
    remove: "usenet.stagedList.remove",
    expiresIn: "usenet.stagedList.expiresIn",
    confirmTitle: "usenet.stagedList.confirmClear.title",
    confirmMessage: "usenet.stagedList.confirmClear.message",
    confirm: "usenet.stagedList.confirmClear.confirm",
  },
  torrent: {
    title: "torrent.stagedList.title",
    emptyTitle: "torrent.stagedList.empty.title",
    emptyDescription: "torrent.stagedList.empty.description",
    loading: "torrent.stagedList.loading",
    loadError: "torrent.stagedList.loadError",
    clearAll: "torrent.stagedList.clearAll",
    remove: "torrent.stagedList.remove",
    expiresIn: "torrent.stagedList.expiresIn",
    confirmTitle: "torrent.stagedList.confirmClear.title",
    confirmMessage: "torrent.stagedList.confirmClear.message",
    confirm: "torrent.stagedList.confirmClear.confirm",
  },
};

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
