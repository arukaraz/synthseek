import type { ParseKeys } from "i18next";

import type { JobSummary } from "./types";

export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

export const JOB_NAME_KEYS: Record<JobSummary["id"], ParseKeys<"settings">> = {
  "library-sync": "jobs.registry.library-sync.name",
  "discovery-sweep": "jobs.registry.discovery-sweep.name",
  "pattern-sync": "jobs.registry.pattern-sync.name",
};

export const JOB_DESCRIPTION_KEYS: Record<JobSummary["id"], ParseKeys<"settings">> = {
  "library-sync": "jobs.registry.library-sync.description",
  "discovery-sweep": "jobs.registry.discovery-sweep.description",
  "pattern-sync": "jobs.registry.pattern-sync.description",
};
