import { keepPreviousData } from "@tanstack/react-query";
import type { inferRouterInputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";

const RUNNING_REFETCH_MS = 8000;
const IDLE_REFETCH_MS = 30000;

type PreviewClasses = inferRouterInputs<AppRouter>["library"]["organise"]["preview"]["classes"];

export function useLibraryOrganisePreview(enabled: boolean, classes: PreviewClasses) {
  return trpc.library.organise.preview.useQuery(
    { classes },
    { enabled, staleTime: 0, placeholderData: keepPreviousData }
  );
}

export function useLibraryOrganiseStatus() {
  return trpc.library.organise.status.useQuery(undefined, {
    staleTime: 0,
    refetchInterval: (query) => (query.state.data?.running ? RUNNING_REFETCH_MS : IDLE_REFETCH_MS),
  });
}
