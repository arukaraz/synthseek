import type { LibrarySourceDescription } from "@hooks/api/queries/library-source/types";
import i18n from "@locale";
import { resolveByCode } from "@modules/errors";
import { formatBytes } from "@utils/formatters";
import { callbackErrorOf, linkedAtProvider } from "@utils/sign-in-callback";

import type { RequestPresetOrigin } from "@features/search/components/ConfigRequestModal/types";
import type { ParseKeys } from "i18next";

import { LOCKED_PRESET_KEYS } from "./constants";
import type { LinkCallbackOutcome, QuotaUsageView, SignInIdentityView } from "./types";

export function sessionSourcesOf(
  sources: ReadonlyArray<LibrarySourceDescription> | undefined
): LibrarySourceDescription[] {
  return (sources ?? []).filter(
    (source) => source.capabilities.connect === "session" && (source.configured || source.connected)
  );
}

export function linkOutcomeOf(search: string): LinkCallbackOutcome {
  const coded = callbackErrorOf(search);
  return {
    linked: linkedAtProvider(search),
    failure: coded === null ? null : resolveByCode(coded.appCode, coded.appParams),
  };
}

export function identityOf(
  identities: readonly SignInIdentityView[],
  provider: SignInIdentityView["provider"]
): SignInIdentityView | null {
  return identities.find((identity) => identity.provider === provider) ?? null;
}

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
