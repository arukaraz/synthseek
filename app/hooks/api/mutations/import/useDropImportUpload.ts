"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import i18n from "@locale";
import type { ParseKeys } from "i18next";

const UPLOAD_URL = "/api/v1/import/upload";

export const DropImportRejectedReason = z.enum([
  "unsupportedType",
  "zipSlip",
  "nestedArchive",
  "batchCap",
  "extractionError",
]);
export type DropImportRejectedReason = z.infer<typeof DropImportRejectedReason>;

const RejectedEntrySchema = z.object({
  name: z.string(),
  reason: DropImportRejectedReason,
});
export type DropImportRejectedEntry = z.infer<typeof RejectedEntrySchema>;

const UploadSuccessSchema = z.object({
  batchId: z.string(),
  totalFiles: z.number(),
  rejected: z.array(RejectedEntrySchema),
});

const UploadErrorSchema = z.object({
  error: z.string(),
  rejected: z.array(RejectedEntrySchema).optional(),
});

export const DropImportUploadErrorCode = z.enum([
  "unsupportedMediaType",
  "tooManyFiles",
  "batchTooLarge",
  "malformedUpload",
  "unexpectedField",
  "noAcceptedFiles",
  "uploadFailed",
]);
export type DropImportUploadErrorCode = z.infer<typeof DropImportUploadErrorCode>;

const UPLOAD_ERROR_KEYS: Record<DropImportUploadErrorCode, ParseKeys<"mutations">> = {
  unsupportedMediaType: "dropImport.uploadError.unsupportedMediaType",
  tooManyFiles: "dropImport.uploadError.tooManyFiles",
  batchTooLarge: "dropImport.uploadError.batchTooLarge",
  malformedUpload: "dropImport.uploadError.malformedUpload",
  unexpectedField: "dropImport.uploadError.unexpectedField",
  noAcceptedFiles: "dropImport.uploadError.noAcceptedFiles",
  uploadFailed: "dropImport.uploadError.uploadFailed",
};

export type DropImportUploadResult =
  | { ok: true; batchId: string; totalFiles: number; rejected: DropImportRejectedEntry[] }
  | { ok: false; code: DropImportUploadErrorCode; rejected: DropImportRejectedEntry[] };

function normalizeErrorCode(raw: string): DropImportUploadErrorCode {
  const parsed = DropImportUploadErrorCode.safeParse(raw);
  return parsed.success ? parsed.data : DropImportUploadErrorCode.enum.uploadFailed;
}

function parseUploadResponse(status: number, body: string): DropImportUploadResult {
  let json: unknown = null;
  try {
    json = JSON.parse(body);
  } catch {
    return { ok: false, code: DropImportUploadErrorCode.enum.uploadFailed, rejected: [] };
  }

  if (status === 201) {
    const parsed = UploadSuccessSchema.safeParse(json);
    if (parsed.success) return { ok: true, ...parsed.data };
    return { ok: false, code: DropImportUploadErrorCode.enum.uploadFailed, rejected: [] };
  }

  const parsed = UploadErrorSchema.safeParse(json);
  if (parsed.success) {
    return { ok: false, code: normalizeErrorCode(parsed.data.error), rejected: parsed.data.rejected ?? [] };
  }
  return { ok: false, code: DropImportUploadErrorCode.enum.uploadFailed, rejected: [] };
}

function sendUpload(files: File[], onProgress: (ratio: number) => void): Promise<DropImportUploadResult> {
  return new Promise((resolve) => {
    const form = new FormData();
    for (const file of files) form.append("files", file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", UPLOAD_URL);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) onProgress(event.loaded / event.total);
    };
    xhr.onerror = () => resolve({ ok: false, code: DropImportUploadErrorCode.enum.uploadFailed, rejected: [] });
    xhr.onload = () => resolve(parseUploadResponse(xhr.status, xhr.responseText));

    xhr.send(form);
  });
}

export function useDropImportUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(async (files: File[]): Promise<DropImportUploadResult> => {
    setIsUploading(true);
    setProgress(0);
    try {
      const result = await sendUpload(files, setProgress);
      if (result.ok) {
        toast.success(i18n.t("mutations:dropImport.uploadComplete", { count: result.totalFiles }));
      } else {
        toast.error(i18n.t(`mutations:${UPLOAD_ERROR_KEYS[result.code]}`));
      }
      return result;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, []);

  return { upload, isUploading, progress };
}
