import type { ParseKeys } from "i18next";

import type {
  Affix,
  LidarrHealth,
  LidarrStatusTone,
  ServerTestOutcome,
  SlskdHealth,
  SlskdStatusTone,
  SubsonicSourceTestOutcome,
} from "./types";

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
