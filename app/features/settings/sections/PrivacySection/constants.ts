import type { ParseKeys } from "i18next";

import type {
  ChannelScope,
  HistoryRange,
  LeavingStatus,
  PlayChannelRow,
  ScrobbleService,
  SessionLengthChoice,
} from "./types";

export const CONNECTIONS_HREF = "/settings/connections/services";

export const PLAY_CHANNEL_ROWS: readonly PlayChannelRow[] = [
  {
    channel: "history",
    anchor: "privacy.channels.history",
    labelKey: "privacy.channels.history.label",
    descriptionKey: "privacy.channels.history.description",
  },
  {
    channel: "scrobble",
    anchor: "privacy.channels.scrobble",
    labelKey: "privacy.channels.scrobble.label",
    descriptionKey: "privacy.channels.scrobble.description",
  },
  {
    channel: "mediaServer",
    anchor: "privacy.channels.mediaServer",
    labelKey: "privacy.channels.mediaServer.label",
    descriptionKey: "privacy.channels.mediaServer.description",
  },
  {
    channel: "nowPlaying",
    anchor: "privacy.channels.nowPlaying",
    labelKey: "privacy.channels.nowPlaying.label",
    descriptionKey: "privacy.channels.nowPlaying.description",
  },
];

export const CHANNEL_SCOPE_KEYS: Readonly<Record<ChannelScope, ParseKeys<"settings">>> = {
  default: "privacy.channels.default",
  private: "privacy.channels.private",
};

export const CHANNEL_SCOPES: readonly ChannelScope[] = ["default", "private"];

export const SESSION_LENGTH_KEYS: Readonly<Record<SessionLengthChoice, ParseKeys<"settings">>> = {
  "30": "privacy.sessionLength.options.30",
  "60": "privacy.sessionLength.options.60",
  "120": "privacy.sessionLength.options.120",
  "360": "privacy.sessionLength.options.360",
  open: "privacy.sessionLength.options.open",
  custom: "privacy.sessionLength.options.custom",
};

export const SESSION_LENGTH_ORDER: readonly SessionLengthChoice[] = ["30", "60", "120", "360", "open", "custom"];

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
