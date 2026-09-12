import { keepPreviousData } from "@tanstack/react-query";

import type { MoveClass } from "@features/settings/sections/LibrarySection/types";
import { trpc } from "@utils/trpc";

export function useLibraryNamingCurrent() {
  return trpc.library.naming.current.useQuery(undefined, { staleTime: 0 });
}

export function useLibraryNamingPreview(template: string, enabled: boolean) {
  return trpc.library.naming.preview.useQuery(
    { template },
    { enabled, staleTime: 0, placeholderData: keepPreviousData }
  );
}

export function useLibraryNamingSamples(template: string, enabled: boolean) {
  return trpc.library.naming.samples.useQuery(
    { template },
    { enabled, staleTime: 0, placeholderData: keepPreviousData }
  );
}

export function useLibraryNamingMoves(
  input: { template: string; classes: MoveClass[]; search: string; page: number; pageSize: number },
  enabled: boolean
) {
  return trpc.library.naming.moves.useQuery(input, { enabled, staleTime: 0, placeholderData: keepPreviousData });
}
