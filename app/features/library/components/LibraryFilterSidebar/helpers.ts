import { RequestStatus } from "@api/__generated__/types";
import type { LibraryFacetValue } from "@hooks/api/queries/library/types";
import type { TFunction } from "i18next";

import type { FacetSearchState } from "../../types";

export function facetSearchTerm(facetSearch: FacetSearchState, key: string | undefined): string {
  if (key === "artist") return facetSearch.artist ?? "";
  if (key === "genre") return facetSearch.genre ?? "";
  if (key === "playlist") return facetSearch.playlist ?? "";
  if (key === "owner") return facetSearch.owner ?? "";
  return "";
}

function sentenceCaseValue(value: string): string {
  const spaced = value.split("_").join(" ");
  if (spaced.length === 0) return spaced;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function statusFacetLabel(value: string, t: TFunction<"status">): string {
  const parsed = RequestStatus.safeParse(value);
  if (parsed.success) return t(`request.${parsed.data}.label`);
  return sentenceCaseValue(value);
}

export function staticFacetValues(
  staticValues: readonly string[],
  values: LibraryFacetValue[],
  t: TFunction<"status">
): LibraryFacetValue[] {
  const countByValue = new Map(values.map((entry) => [entry.value, entry.count]));
  return staticValues.map((value) => ({
    value,
    label: statusFacetLabel(value, t),
    count: countByValue.get(value) ?? 0,
  }));
}
