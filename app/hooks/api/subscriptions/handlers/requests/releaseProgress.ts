import type { ActiveRelease, ReleaseProgressPayload } from "@api/__generated__/types";
import type { QueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@utils/trpc";

function isSameRelease(release: ActiveRelease, event: ReleaseProgressPayload): boolean {
  return release.userId === event.userId && release.source === event.source && release.releaseKey === event.releaseKey;
}

export function handleReleaseProgress(event: ReleaseProgressPayload, queryClient: QueryClient): void {
  queryClient.setQueriesData<ActiveRelease[]>({ queryKey: getQueryKey(trpc.requests.activeReleases) }, (old) => {
    if (!old) return old;
    const index = old.findIndex((release) => isSameRelease(release, event));
    if (event.release === null) return index === -1 ? old : old.filter((_, at) => at !== index);
    if (index === -1) return [...old, event.release];
    const next = [...old];
    next[index] = event.release;
    return next;
  });
}
