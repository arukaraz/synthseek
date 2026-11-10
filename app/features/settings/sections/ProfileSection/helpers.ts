import i18n from "@locale";
import { formatBytes } from "@utils/formatters";

import type { RequestPresetOrigin } from "@features/search/components/ConfigRequestModal/types";
import type { ParseKeys } from "i18next";

import { LOCKED_PRESET_KEYS } from "./constants";
import type { QuotaUsageView } from "./types";

export function lockedPresetKey(origin: RequestPresetOrigin): ParseKeys<"settings"> {
  return LOCKED_PRESET_KEYS[origin];
}

export function quotaTracksValue(tracks: QuotaUsageView["tracks"]): string {
  if (tracks.limit === null) return i18n.t("settings:profile.quota.unlimited");
  return i18n.t("settings:profile.quota.tracksValue", {
    used: tracks.used,
    limit: tracks.limit,
    count: tracks.windowDays,
  });
}

export function quotaStorageValue(storage: QuotaUsageView["storage"]): string {
  if (storage.limitBytes === null) return i18n.t("settings:profile.quota.unlimited");
  return i18n.t("settings:profile.quota.storageValue", {
    used: formatBytes(storage.storedBytes + storage.pendingBytes),
    limit: formatBytes(storage.limitBytes),
  });
}

export function quotaStoragePending(storage: QuotaUsageView["storage"]): string | null {
  if (storage.limitBytes === null || storage.pendingBytes <= 0) return null;
  return i18n.t("settings:profile.quota.storagePending", { pending: formatBytes(storage.pendingBytes) });
}
