import type { FollowTypeKey, FollowTypes } from "@hooks/api/queries/artist-follow/types";
import i18n from "@locale";

export const FOLLOW_TYPE_ORDER: readonly FollowTypeKey[] = ["album", "ep", "single"];

export const FOLLOW_TYPE_LABEL_KEYS = {
  album: "types.albums",
  ep: "types.eps",
  single: "types.singles",
} as const;

export function followTypesPhrase(types: FollowTypes): string {
  const labels = FOLLOW_TYPE_ORDER.filter((key) => types[key]).map((key) =>
    i18n.t(FOLLOW_TYPE_LABEL_KEYS[key], { ns: "follows" })
  );
  return new Intl.ListFormat(i18n.language, { style: "long", type: "conjunction" }).format(labels);
}
