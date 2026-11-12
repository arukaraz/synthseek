import type { ParseKeys } from "i18next";

import type { HistoryRange, LeavingStatus, ScrobbleService } from "./types";

export const CONNECTIONS_HREF = "/settings/connections/services";

export const DEFAULT_HISTORY_RANGE: HistoryRange = "hour";

export const HISTORY_RANGE_KEYS: Readonly<Record<HistoryRange, ParseKeys<"settings">>> = {
  hour: "privacy.history.clear.ranges.hour",
  day: "privacy.history.clear.ranges.day",
  week: "privacy.history.clear.ranges.week",
  all: "privacy.history.clear.ranges.all",
};

export const LEAVING_STATUS_KEYS: Readonly<Record<LeavingStatus, ParseKeys<"settings">>> = {
  on: "privacy.leaving.on",
  off: "privacy.leaving.off",
  notConnected: "privacy.leaving.notConnected",
};

export const SCROBBLE_LABEL_KEYS: Readonly<Record<ScrobbleService, ParseKeys<"settings">>> = {
  lastfm: "privacy.leaving.lastfm",
  listenbrainz: "privacy.leaving.listenbrainz",
};
