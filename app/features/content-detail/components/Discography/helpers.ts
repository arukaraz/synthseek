import type { TFunction } from "i18next";

import { RECORD_TYPE_ORDER, RECORD_TYPE_SINGULAR_KEY } from "./constants";
import type { DiscographyGroup, DiscographyRecordType } from "./types";

export function orderedGroups(groups: DiscographyGroup[]): DiscographyGroup[] {
  return [...groups]
    .filter((group) => group.albums.length > 0)
    .sort((a, b) => RECORD_TYPE_ORDER.indexOf(a.recordType) - RECORD_TYPE_ORDER.indexOf(b.recordType));
}

export function releaseMeta(
  t: TFunction<"contentDetail">,
  year: number | null,
  recordType: DiscographyRecordType
): string {
  const type = t(RECORD_TYPE_SINGULAR_KEY[recordType]);
  return year === null ? type : t("releaseMeta", { year, type });
}
