import { keepPreviousData } from "@tanstack/react-query";
import type { inferRouterInputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";

type NamingInputs = inferRouterInputs<AppRouter>["library"]["naming"];

export function useLibraryNamingCurrent() {
  return trpc.library.naming.current.useQuery(undefined, { staleTime: 0 });
}

export function useLibraryNamingPreview(input: NamingInputs["preview"], enabled: boolean) {
  return trpc.library.naming.preview.useQuery(input, { enabled, staleTime: 0, placeholderData: keepPreviousData });
}

export function useLibraryNamingSamples(template: string, enabled: boolean) {
  return trpc.library.naming.samples.useQuery(
    { template },
    { enabled, staleTime: 0, placeholderData: keepPreviousData }
  );
}

export function useLibraryNamingMoves(input: NamingInputs["moves"], enabled: boolean) {
  return trpc.library.naming.moves.useQuery(input, { enabled, staleTime: 0, placeholderData: keepPreviousData });
}
