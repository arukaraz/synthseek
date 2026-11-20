import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useImportPlaylistM3u() {
  const utils = trpc.useUtils();

  return trpc.playlists.importM3u.useMutation({
    onSuccess: (report) => {
      if (!report.committed) return;
      toast.success(i18n.t("mutations:playlists.m3uImported", { count: report.added }));
      void utils.contentDetail.playlistDetail.invalidate();
      void utils.library.getPlaylists.invalidate();
    },
    onError: (error) => errorToast(error, "playlists.m3uImportFailed"),
  });
}
