import { RequestStatus } from "@api/__generated__/types";
import type { LibraryFacetValue } from "@hooks/api/queries/library/types";
import { sourceLabelFor } from "@hooks/ui/player";
import { capitalize } from "@utils/string";
import type { TFunction } from "i18next";

import type { FacetDef, FacetSearchState } from "../../types";

export function playbackSourceFacetValues(values: LibraryFacetValue[], localLabel: string): LibraryFacetValue[] {
  return values.map((value) => ({ ...value, label: sourceLabelFor(value.value, localLabel) }));
}

export function originFacetValues(values: LibraryFacetValue[]): LibraryFacetValue[] {
  return values.map((value) => ({ ...value, label: capitalize(value.value) }));
}

export function facetDefsWithChoice(
  defs: readonly FacetDef[],
  facets: Readonly<Record<string, LibraryFacetValue[]>>
): FacetDef[] {
  return defs.filter((def) => !def.hideWithoutChoice || (facets[def.key] ?? []).length > 1);
}

export function facetSearchTerm(facetSearch: FacetSearchState, key: string | undefined): string {
  if (key === "artist") return facetSearch.artist ?? "";
  if (key === "genre") return facetSearch.genre ?? "";
  if (key === "playlist") return facetSearch.playlist ?? "";
  if (key === "owner") return facetSearch.owner ?? "";
  return "";
}

function sentenceCaseValue(value: string): string {
  return capitalize(value.split("_").join(" "));
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
