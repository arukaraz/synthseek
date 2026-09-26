import { toast } from "sonner";

import i18n from "@locale";
import { errorToast, type ErrorMutationMeta } from "@modules/errors";
import { trpc } from "@utils/trpc";

const LIBRARY_SOURCE_META: ErrorMutationMeta = { errorCategory: "generic" };

export function useSaveLibrarySourceChanges(providerName: string) {
  const utils = trpc.useUtils();
  return trpc.librarySource.provider.save.useMutation({
    meta: LIBRARY_SOURCE_META,
    onSuccess: async (result) => {
      const queuedImports = result.playlistsImported + result.savedAlbumsImported + (result.likedSongsImported ? 1 : 0);
      const parts: string[] = [];
      if (result.syncToggled > 0) {
        parts.push(i18n.t("mutations:librarySource.syncUpdates", { count: result.syncToggled }));
      }
      if (result.subscriptionUpdated) parts.push(i18n.t("mutations:librarySource.watchersSaved"));
      const summary = parts.join(" · ");
      if (queuedImports === 0) {
        if (parts.length === 0) {
          toast.info(i18n.t("mutations:librarySource.noChangesApplied"));
        } else {
          toast.success(i18n.t("mutations:librarySource.libraryUpdated", { provider: providerName }), {
            description: summary,
          });
        }
      }
      await Promise.all([
        utils.requests.getAll.refetch(),
        utils.requests.getLibrarySummary.invalidate(),
        utils.librarySource.provider.items.invalidate(),
        utils.librarySource.provider.all.invalidate(),
        utils.librarySource.subscription.get.invalidate(),
      ]);
    },
    onError: (error) => errorToast(error, "librarySource.saveFailed"),
  });
}
