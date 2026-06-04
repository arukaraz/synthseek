import { toast } from "sonner";

import i18n from "@locale";

const REVOKE_DELAY_MS = 1000;
const FILENAME_PATTERN = /filename="?([^"]+)"?/;

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}

function filenameFromDisposition(disposition: string | null): string | null {
  if (!disposition) return null;
  const match = FILENAME_PATTERN.exec(disposition);
  return match ? match[1] : null;
}

export function downloadText(filename: string, text: string): void {
  triggerBlobDownload(new Blob([text], { type: "text/plain;charset=utf-8" }), filename);
}

export async function triggerDownload(url: string, fallbackName: string): Promise<void> {
  try {
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) {
      toast.error(
        response.status === 403
          ? i18n.t("mutations:requests.adminRequired")
          : i18n.t("mutations:requests.downloadFailed")
      );
      return;
    }
    const blob = await response.blob();
    const filename = filenameFromDisposition(response.headers.get("content-disposition")) ?? fallbackName;
    triggerBlobDownload(blob, filename);
  } catch {
    toast.error(i18n.t("mutations:requests.downloadFailed"));
  }
}
