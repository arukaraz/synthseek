import { keepPreviousData } from "@tanstack/react-query";
import type { inferRouterInputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";

const RETRYING_REFETCH_MS = 8000;

type UnidentifiedInputs = inferRouterInputs<AppRouter>["library"]["scan"]["unidentified"];
type ListInput = UnidentifiedInputs["list"];
type AlbumCandidatesInput = UnidentifiedInputs["albumCandidates"];
type AlbumProposalInput = UnidentifiedInputs["albumProposal"];
type SongCandidatesInput = UnidentifiedInputs["songCandidates"];

export function useUnidentifiedFiles(input: ListInput, enabled: boolean) {
  return trpc.library.scan.unidentified.list.useQuery(input, {
    enabled,
    staleTime: 0,
    placeholderData: keepPreviousData,
    refetchInterval: (query) =>
      query.state.data?.groups.some((group) => group.retrying > 0) ? RETRYING_REFETCH_MS : false,
  });
}

export function useUnidentifiedAlbumCandidates(input: AlbumCandidatesInput, enabled: boolean) {
  return trpc.library.scan.unidentified.albumCandidates.useQuery(input, {
    enabled,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useUnidentifiedAlbumProposal(input: AlbumProposalInput, enabled: boolean) {
  return trpc.library.scan.unidentified.albumProposal.useQuery(input, { enabled, staleTime: 60 * 1000 });
}

export function useUnidentifiedSongCandidates(input: SongCandidatesInput, enabled: boolean) {
  return trpc.library.scan.unidentified.songCandidates.useQuery(input, {
    enabled,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
