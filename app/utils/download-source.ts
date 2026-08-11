import type { ParseKeys } from "i18next";

const DOWNLOAD_SOURCE_LABEL_KEYS: Partial<Record<string, ParseKeys<"settings">>> = {
  slskd: "quarantine.source.slskd",
  ytdlp: "quarantine.source.ytdlp",
};

export function downloadSourceLabelKey(source: string): ParseKeys<"settings"> | null {
  return DOWNLOAD_SOURCE_LABEL_KEYS[source] ?? null;
}
