import { DISCOGRAPHY_PENDING_MAX_FETCHES, DISCOGRAPHY_PENDING_REFETCH_MS } from "./constants";

export function discographyRefetchInterval(releaseTypesPending: boolean | undefined, fetches: number): number | false {
  return releaseTypesPending === true && fetches < DISCOGRAPHY_PENDING_MAX_FETCHES
    ? DISCOGRAPHY_PENDING_REFETCH_MS
    : false;
}
