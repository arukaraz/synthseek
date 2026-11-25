"use client";

import i18n from "@locale";
import { formatBytes } from "@utils/formatters";
import { trpc } from "@utils/trpc";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { PLAYLIST_COVER_FIELD, PLAYLIST_COVER_UPLOAD_PATH } from "./constants";
import { coverErrorKey, coverUploadFailure } from "./helpers";
import { invalidateRequestListQueries } from "../../queries/requests/requestListCache";

export function useUploadPlaylistCover(playlistId: string, maxBytes: number) {
  const utils = trpc.useUtils();
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(
    async (file: File): Promise<boolean> => {
      const size = formatBytes(maxBytes);
      if (file.size > maxBytes) {
        toast.error(i18n.t(`mutations:${coverErrorKey("PLAYLIST_COVER_TOO_LARGE")}`, { size }));
        return false;
      }
      setIsUploading(true);
      try {
        const form = new FormData();
        form.append(PLAYLIST_COVER_FIELD, file, file.name);
        const response = await fetch(`${PLAYLIST_COVER_UPLOAD_PATH}/${encodeURIComponent(playlistId)}`, {
          method: "POST",
          body: form,
          credentials: "include",
        });
        if (!response.ok) {
          toast.error(i18n.t(`mutations:${coverErrorKey(await coverUploadFailure(response))}`, { size }));
          return false;
        }
        toast.success(i18n.t("mutations:playlists.coverUpdated"));
        return true;
      } catch {
        toast.error(i18n.t(`mutations:${coverErrorKey(null)}`));
        return false;
      } finally {
        setIsUploading(false);
        void utils.contentDetail.playlistDetail.invalidate();
        void utils.library.getPlaylists.invalidate();
        invalidateRequestListQueries(utils);
      }
    },
    [playlistId, maxBytes, utils]
  );

  return { upload, isUploading };
}
