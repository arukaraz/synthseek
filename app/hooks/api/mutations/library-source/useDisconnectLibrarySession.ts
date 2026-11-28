import type { ErrorMutationMeta } from "@modules/errors";
import { trpc } from "@utils/trpc";

const DISCONNECT_META: ErrorMutationMeta = { errorCategory: "generic" };

export function useDisconnectLibrarySession() {
  const utils = trpc.useUtils();
  return trpc.librarySource.provider.disconnectSession.useMutation({
    meta: DISCONNECT_META,
    onSettled: () => {
      void utils.librarySource.provider.all.invalidate();
      void utils.librarySource.provider.items.invalidate();
    },
  });
}
