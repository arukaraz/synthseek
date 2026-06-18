export const PERSISTABLE_WHOLE_ROUTERS = ["contentDetail"];

export const PERSISTABLE_PROCEDURES = [{ router: "music", procedure: "getContents" }];

export const PERSIST_STORAGE_KEY = "synthseek-query-cache";

export const PERSIST_MAX_AGE = 24 * 60 * 60 * 1000;

export const PERSIST_BUSTER = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";

export const PERSISTED_QUERY_GC_TIME = 24 * 60 * 60 * 1000;
