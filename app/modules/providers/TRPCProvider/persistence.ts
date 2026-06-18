import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import type { Persister } from "@tanstack/react-query-persist-client";
import type { QueryKey } from "@tanstack/react-query";

import { PERSISTABLE_PROCEDURES, PERSISTABLE_WHOLE_ROUTERS, PERSIST_STORAGE_KEY } from "./constants";
import type { DehydrateCandidate, QueryProcedurePath } from "./types";

function getProcedurePath(queryKey: QueryKey): QueryProcedurePath | null {
  const [path] = queryKey;
  if (!Array.isArray(path)) return null;
  const [router, procedure] = path;
  if (typeof router !== "string") return null;
  return { router, procedure: typeof procedure === "string" ? procedure : null };
}

export function shouldDehydrateQuery(query: DehydrateCandidate): boolean {
  if (query.state.status !== "success") return false;
  const path = getProcedurePath(query.queryKey);
  if (path === null) return false;
  if (PERSISTABLE_WHOLE_ROUTERS.includes(path.router)) return true;
  return PERSISTABLE_PROCEDURES.some((entry) => entry.router === path.router && entry.procedure === path.procedure);
}

function getNoopStorage(): Storage {
  return {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
    clear: () => undefined,
    key: () => null,
    length: 0,
  };
}

export function createQueryPersister(): Persister {
  const storage = typeof window === "undefined" ? getNoopStorage() : window.localStorage;
  return createSyncStoragePersister({ storage, key: PERSIST_STORAGE_KEY });
}
