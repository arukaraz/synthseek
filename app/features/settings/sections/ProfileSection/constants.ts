import type { ParseKeys } from "i18next";

export const PLEX_SOURCE_KEY = "plex";

export const REPORT_FAILURE_KEYS: Readonly<Record<string, ParseKeys<"settings">>> = {
  unauthorized: "profile.connected.plex.reporting.unauthorized",
  unreachable: "profile.connected.plex.reporting.unreachable",
};
