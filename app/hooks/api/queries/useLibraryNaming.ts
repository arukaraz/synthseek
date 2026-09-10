import { keepPreviousData } from "@tanstack/react-query";

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
