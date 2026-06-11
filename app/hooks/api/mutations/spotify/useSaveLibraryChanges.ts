import { toast } from "sonner";

import i18n from "@locale";
import { errorToast, type ErrorMutationMeta } from "@modules/errors";
import { trpc } from "@utils/trpc";

const SPOTIFY_META: ErrorMutationMeta = { errorCategory: "spotify" };

export function useSaveLibraryChanges() {
  const utils = trpc.useUtils();
  return trpc.librarySource.spotify.saveLibraryChanges.useMutation({
    meta: SPOTIFY_META,
    onSuccess: async (result) => {
      const queuedImports = result.playlistsImported + result.savedAlbumsImported + (result.likedSongsImported ? 1 : 0);
      const parts: string[] = [];
      if (result.syncToggled > 0) parts.push(i18n.t("mutations:spotify.syncUpdates", { count: result.syncToggled }));
      if (result.subscriptionUpdated) parts.push(i18n.t("mutations:spotify.watchersSaved"));
      const summary = parts.join(" · ");
      if (queuedImports === 0) {
        if (parts.length === 0) {
          toast.info(i18n.t("mutations:spotify.noChangesApplied"));
        } else {
          toast.success(i18n.t("mutations:spotify.libraryUpdated"), { description: summary });
        }
      }
      await Promise.all([
        utils.requests.getAll.refetch(),
        utils.requests.getLibrarySummary.invalidate(),
        utils.librarySource.spotify.listLibraryItems.invalidate(),
        utils.librarySource.subscription.get.invalidate(),
      ]);
    },
    onError: (error) => errorToast(error, "spotify.saveFailed"),
  });
}
