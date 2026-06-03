import { toast } from "sonner";

import type { ErrorMutationMeta } from "@modules/errors";
import { trpc } from "@utils/trpc";

const SPOTIFY_META: ErrorMutationMeta = { errorCategory: "spotify" };

export function useSaveLibraryChanges() {
  const utils = trpc.useUtils();
  return trpc.librarySource.spotify.saveLibraryChanges.useMutation({
    meta: SPOTIFY_META,
    onSuccess: async (result) => {
      const queuedImports = result.playlistsImported + result.savedAlbumsImported + (result.likedSongsImported ? 1 : 0);
      const parts: string[] = [];
      if (queuedImports > 0) parts.push(`${queuedImports} import${queuedImports === 1 ? "" : "s"} queued`);
      if (result.syncToggled > 0) parts.push(`${result.syncToggled} sync update${result.syncToggled === 1 ? "" : "s"}`);
      if (result.subscriptionUpdated) parts.push("watchers saved");
      if (parts.length === 0) {
        toast.info("No changes applied");
      } else if (queuedImports > 0) {
        toast.success("Spotify library updated", {
          description: `${parts.join(" · ")}. Processing, items will appear shortly.`,
        });
      } else {
        toast.success("Spotify library updated", { description: parts.join(" · ") });
      }
      await Promise.all([
        utils.requests.getAll.refetch(),
        utils.requests.getLibrarySummary.invalidate(),
        utils.librarySource.spotify.listLibraryItems.invalidate(),
        utils.librarySource.subscription.get.invalidate(),
      ]);
    },
  });
}
