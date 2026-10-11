import type { AppRouter } from "@api/__generated__/types";
import type { inferRouterOutputs } from "@trpc/server";
import type { ParseKeys } from "i18next";

type DownloadSourceKey = keyof inferRouterOutputs<AppRouter>["settings"]["downloadSourcesAvailability"];

const DOWNLOAD_SOURCE_LABEL_KEYS = {
  slskd: "quarantine.source.slskd",
  ytdlp: "quarantine.source.ytdlp",
  usenet: "quarantine.source.usenet",
} as const satisfies Record<DownloadSourceKey, ParseKeys<"settings">>;

const LABEL_KEYS = new Map<string, ParseKeys<"settings">>(Object.entries(DOWNLOAD_SOURCE_LABEL_KEYS));

export function downloadSourceLabelKey(source: string): ParseKeys<"settings"> | null {
  return LABEL_KEYS.get(source) ?? null;
}
