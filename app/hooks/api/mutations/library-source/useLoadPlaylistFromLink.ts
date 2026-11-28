import type { ErrorMutationMeta } from "@modules/errors";
import { trpc } from "@utils/trpc";

const LINK_META: ErrorMutationMeta = { silent: true };

export function useLoadPlaylistFromLink() {
  return trpc.librarySource.provider.playlistFromLink.useMutation({
    meta: LINK_META,
    trpc: { context: { skipBatch: true } },
  });
}
