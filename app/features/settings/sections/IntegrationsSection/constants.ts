import type { ParseKeys } from "i18next";

import type { Affix, LidarrHealth, LidarrStatusTone, ServerTestOutcome, SlskdHealth, SlskdStatusTone } from "./types";

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
