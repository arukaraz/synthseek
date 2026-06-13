import type { FacetSearchState } from "../../types";

export function facetSearchTerm(facetSearch: FacetSearchState, key: string | undefined): string {
  if (key === "artist") return facetSearch.artist ?? "";
  if (key === "genre") return facetSearch.genre ?? "";
  if (key === "playlist") return facetSearch.playlist ?? "";
  if (key === "owner") return facetSearch.owner ?? "";
  return "";
}
