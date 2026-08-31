import type { ParseKeys } from "i18next";

import type { JobSummary } from "./types";

export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

export const JOB_NAME_KEYS: Record<JobSummary["id"], ParseKeys<"settings">> = {
  "library-sync": "jobs.registry.library-sync.name",
  "discovery-sweep": "jobs.registry.discovery-sweep.name",
  "media-server-sync": "jobs.registry.media-server-sync.name",
  "wanted-sweep": "jobs.registry.wanted-sweep.name",
  "usenet-staging-sweep": "jobs.registry.usenet-staging-sweep.name",
  "library-scan": "jobs.registry.library-scan.name",
};

export const JOB_DESCRIPTION_KEYS: Record<JobSummary["id"], ParseKeys<"settings">> = {
  "library-sync": "jobs.registry.library-sync.description",
  "discovery-sweep": "jobs.registry.discovery-sweep.description",
  "media-server-sync": "jobs.registry.media-server-sync.description",
  "wanted-sweep": "jobs.registry.wanted-sweep.description",
  "usenet-staging-sweep": "jobs.registry.usenet-staging-sweep.description",
  "library-scan": "jobs.registry.library-scan.description",
};
