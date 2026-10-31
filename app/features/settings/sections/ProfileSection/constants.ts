import type { ParseKeys } from "i18next";

import type { SetVeto } from "@hooks/api/queries/widgets/types";

import type { SourceLinkOutcome } from "./types";

export const PLEX_SOURCE_KEY = "plex";

export const REPORT_FAILURE_KEYS: Readonly<Record<string, ParseKeys<"settings">>> = {
  unauthorized: "profile.connected.plex.reporting.unauthorized",
  unreachable: "profile.connected.plex.reporting.unreachable",
};

export const SERVER_REPORT_FAILURE_KEYS: Readonly<Record<string, ParseKeys<"settings">>> = {
  unauthorized: "profile.connected.server.unauthorized",
  unreachable: "profile.connected.server.unreachable",
};

export const EMPTY_VETO: SetVeto = { artists: [], tracks: [], noTaste: [] };

export const VETO_MENU_LIMIT = 30;

export const VETO_SEARCH_DEBOUNCE_MS = 250;

export const LINK_OUTCOME_KEYS: Readonly<Record<SourceLinkOutcome, ParseKeys<"settings">>> = {
  linked: "profile.connected.server.linked",
  refused: "profile.connected.server.refused",
  unreachable: "profile.connected.server.linkUnreachable",
  unsupported: "profile.connected.server.linkUnreachable",
};
