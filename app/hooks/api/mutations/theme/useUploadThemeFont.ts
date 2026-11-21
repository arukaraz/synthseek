"use client";

import i18n from "@locale";
import { formatBytes } from "@utils/formatters";
import { trpc } from "@utils/trpc";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { THEME_FONT_FIELD, THEME_FONT_UPLOAD_PATH } from "./constants";
import { fontErrorKey, fontUploadFailure } from "./helpers";

export function useUploadThemeFont(freeBytes: number) {
  const utils = trpc.useUtils();
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(
    async (file: File): Promise<boolean> => {
      const size = formatBytes(freeBytes);
      if (file.size > freeBytes) {
        toast.error(i18n.t(`mutations:${fontErrorKey("THEME_FONT_TOO_LARGE")}`, { size }));
        return false;
      }
      setIsUploading(true);
      try {
        const form = new FormData();
        form.append(THEME_FONT_FIELD, file, file.name);
        const response = await fetch(THEME_FONT_UPLOAD_PATH, { method: "POST", body: form, credentials: "include" });
        if (!response.ok) {
          toast.error(i18n.t(`mutations:${fontErrorKey(await fontUploadFailure(response))}`, { size }));
          return false;
        }
        toast.success(i18n.t("mutations:theme.fontUploaded", { name: file.name }));
        return true;
      } catch {
        toast.error(i18n.t(`mutations:${fontErrorKey(null)}`));
        return false;
      } finally {
        setIsUploading(false);
        void utils.theme.fonts.invalidate();
      }
    },
    [freeBytes, utils]
  );

  return { upload, isUploading };
}
