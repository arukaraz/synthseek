"use client";

import { Type } from "lucide-react";
import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

import { useUploadThemeFont } from "@hooks/api/mutations/theme";

import { FONT_ACCEPT } from "./constants";
import { fileButton, fileInput, meta, metaHint, metaName, uploadActions, uploadSlot, uploadThumb } from "./styles";
import type { FontUploadProps } from "./types";

export function FontUpload({ fonts }: FontUploadProps) {
  const { t } = useTranslation("themeEditor");
  const freeBytes = fonts === undefined ? 0 : Math.max(0, fonts.maxBytes - fonts.usedBytes);
  const { upload, isUploading } = useUploadThemeFont(freeBytes);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (file === undefined) return;
    void upload(file).finally(() => {
      input.value = "";
    });
  };

  return (
    <div className={uploadSlot()}>
      <div className={uploadThumb()} aria-hidden>
        <Type className="size-6" />
      </div>
      <div className={meta()}>
        <span className={metaName()}>{t("fonts.uploadTitle")}</span>
        <span className={metaHint()}>{t("fonts.uploadHint")}</span>
        <div className={uploadActions()}>
          <label className={fileButton()}>
            {isUploading ? t("fonts.uploading") : t("fonts.choose")}
            <input
              type="file"
              className={fileInput()}
              accept={FONT_ACCEPT}
              disabled={fonts === undefined || isUploading}
              aria-label={t("fonts.uploadTitle")}
              onChange={handleChange}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
