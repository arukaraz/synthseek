import { keepPreviousData, skipToken } from "@tanstack/react-query";
import type { inferRouterInputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";

type DestinationInput = inferRouterInputs<AppRouter>["library"]["paths"]["destination"];

export function useLibraryDestination(input: DestinationInput | null) {
  return trpc.library.paths.destination.useQuery(input ?? skipToken, {
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}
