import type { ActiveRelease } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";

export function useRequestReleases(trackIds: readonly string[]): ActiveRelease[] {
  const { data } = trpc.requests.activeReleases.useQuery(undefined, {
    select: (releases) => releases.filter((release) => release.trackRequestIds.some((id) => trackIds.includes(id))),
  });
  return data ?? [];
}

export function useTrackRelease(trackId: string): ActiveRelease | null {
  const { data } = trpc.requests.activeReleases.useQuery(undefined, {
    select: (releases) => releases.find((release) => release.trackRequestIds.includes(trackId)) ?? null,
  });
  return data ?? null;
}

export function useAlbumRelease(albumId: string): ActiveRelease | null {
  const { data } = trpc.requests.activeReleases.useQuery(undefined, {
    select: (releases) => releases.find((release) => release.albumIds.includes(albumId)) ?? null,
  });
  return data ?? null;
}
