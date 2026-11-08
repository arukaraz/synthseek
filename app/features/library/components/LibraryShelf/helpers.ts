import type { LibraryFacetValue } from "@hooks/api/queries/library/types";

import type { FacetDef, FilterParamMap } from "../../types";
import type { ShelfActiveChip } from "./types";

export function revealSelectedTab(scroller: HTMLElement | null): void {
  const tab = scroller?.querySelector<HTMLElement>("[aria-selected='true']");
  if (!scroller || !tab) return;
  const scrollerRect = scroller.getBoundingClientRect();
  const tabRect = tab.getBoundingClientRect();
  const center = tabRect.left - scrollerRect.left + scroller.scrollLeft + tabRect.width / 2;
  scroller.scrollLeft = Math.max(0, center - scrollerRect.width / 2);
}

export function shelfActiveChips(
  defs: readonly FacetDef[],
  filters: FilterParamMap,
  facets: Readonly<Record<string, LibraryFacetValue[]>>,
  label: (def: FacetDef, value: string, values: readonly LibraryFacetValue[]) => string
): ShelfActiveChip[] {
  return defs.flatMap((def) =>
    (filters[def.key] ?? []).map((value) => ({
      key: def.key,
      value,
      label: label(def, value, facets[def.key] ?? []),
    }))
  );
}
