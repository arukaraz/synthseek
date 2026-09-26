import type { ErrorMutationMeta } from "@modules/errors";
import { trpc } from "@utils/trpc";

const LIBRARY_SOURCE_META: ErrorMutationMeta = { errorCategory: "generic" };

export function useConnectLibrarySource() {
  const utils = trpc.useUtils();
  return trpc.librarySource.provider.authUrl.useMutation({
    meta: LIBRARY_SOURCE_META,
    onSuccess: ({ url }) => {
      window.location.assign(url);
    },
    onSettled: () => {
      void utils.librarySource.provider.all.invalidate();
      void utils.librarySource.spotify.getConnectionStatus.invalidate();
    },
  });
}
