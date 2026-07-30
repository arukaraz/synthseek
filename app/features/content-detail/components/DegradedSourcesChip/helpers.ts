import { capitalize } from "@utils/string";
import type { TFunction } from "i18next";

import { DEGRADED_PROVIDER_LABEL_KEYS } from "./constants";

function providerLabelKey(
  source: string
): (typeof DEGRADED_PROVIDER_LABEL_KEYS)[keyof typeof DEGRADED_PROVIDER_LABEL_KEYS] | null {
  const lowered = source.toLowerCase();
  for (const [providerId, messageKey] of Object.entries(DEGRADED_PROVIDER_LABEL_KEYS)) {
    if (providerId === lowered) return messageKey;
  }
  return null;
}

export function degradedProviderLabel(source: string, t: TFunction<"contentDetail">): string {
  const messageKey = providerLabelKey(source);
  if (messageKey) return t(messageKey);
  return capitalize(source);
}
