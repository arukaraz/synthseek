import { RECORD_TYPE_ORDER } from "./constants";
import type { DiscographyGroup } from "./types";

export function orderedGroups(groups: DiscographyGroup[]): DiscographyGroup[] {
  return [...groups]
    .filter((group) => group.albums.length > 0)
    .sort((a, b) => RECORD_TYPE_ORDER.indexOf(a.recordType) - RECORD_TYPE_ORDER.indexOf(b.recordType));
}
