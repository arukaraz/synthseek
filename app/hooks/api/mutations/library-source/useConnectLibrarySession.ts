import type { ErrorMutationMeta } from "@modules/errors";
import { trpc } from "@utils/trpc";

const SESSION_META: ErrorMutationMeta = { silent: true };

export function useConnectLibrarySession() {
  const utils = trpc.useUtils();
  return trpc.librarySource.provider.connectSession.useMutation({
    meta: SESSION_META,
    gcTime: 0,
    trpc: { context: { skipBatch: true } },
    onSuccess: () => {
      void utils.librarySource.provider.all.invalidate();
      void utils.librarySource.provider.items.invalidate();
    },
  });
}
