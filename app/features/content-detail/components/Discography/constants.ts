import type { ParseKeys } from "i18next";

import type { DiscographyRecordType } from "./types";

export const RECORD_TYPE_ORDER: DiscographyRecordType[] = ["album", "ep", "single", "live", "compilation"];

export const RECORD_TYPE_LABEL_KEY: Record<DiscographyRecordType, ParseKeys<"contentDetail">> = {
  album: "recordType.album",
  ep: "recordType.ep",
  single: "recordType.single",
  live: "recordType.live",
  compilation: "recordType.compilation",
};
