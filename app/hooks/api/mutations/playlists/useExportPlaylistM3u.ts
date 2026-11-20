import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { downloadText } from "@utils/download";
import { collectionFilename } from "@utils/filename";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useExportPlaylistM3u() {
  return trpc.playlists.exportM3u.useMutation({
    onSuccess: (result) => {
      if (result.included === 0) {
        toast.error(i18n.t("mutations:playlists.m3uNothingToExport"));
        return;
      }
      downloadText(collectionFilename(result.name, result.extension), result.content);
      if (result.skipped > 0) toast.info(i18n.t("mutations:playlists.m3uExportSkipped", { count: result.skipped }));
    },
    onError: (error) => errorToast(error, "playlists.m3uExportFailed"),
  });
}
