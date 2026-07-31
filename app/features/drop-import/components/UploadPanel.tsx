"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { ProgressBar } from "@components/ui/ProgressBar";
import { useDropImportUpload } from "@hooks/api";

import { ACCEPTED_UPLOAD_EXTENSIONS } from "../constants";
import { dropzone, dropzoneHint, dropzoneTitle, progressLabel, progressWrap } from "../styles";
import type { UploadPanelProps } from "../types";

export function UploadPanel({ onResult }: UploadPanelProps) {
  const { t } = useTranslation("library");
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const { upload, isUploading, progress } = useDropImportUpload();

  const handleFiles = async (files: File[]) => {
    if (files.length === 0 || isUploading) return;
    const result = await upload(files);
    onResult(result);
  };

  const percent = Math.round(progress * 100);

  return (
    <div className="flex flex-col gap-2">
      <div
        className={dropzone({ active: dragActive })}
        role="button"
        tabIndex={0}
        aria-label={t("dropImport.upload.aria")}
        data-loading={isUploading}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          void handleFiles(Array.from(e.dataTransfer.files));
        }}
      >
        <Upload className="text-fg/40 size-6" />
        <span className={dropzoneTitle()}>{t("dropImport.upload.dropTitle")}</span>
        <span className={dropzoneHint()}>{t("dropImport.upload.dropHint")}</span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_UPLOAD_EXTENSIONS}
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            void handleFiles(files);
          }}
        />
      </div>

      {isUploading ? (
        <div className={progressWrap()}>
          <ProgressBar progress={percent} isActive />
          <span className={progressLabel()} role="status">
            {t("dropImport.upload.uploading", { percent })}
          </span>
        </div>
      ) : null}
    </div>
  );
}
