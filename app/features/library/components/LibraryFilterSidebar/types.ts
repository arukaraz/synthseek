import type { LibraryFacetValue } from "@hooks/api/queries/library/types";

import type { FacetDef, FacetSearchState, FilterParamMap, ViewConfig } from "../../types";

export interface LibraryFilterSidebarProps {
  config: ViewConfig;
  facets: Record<string, LibraryFacetValue[]>;
  filters: FilterParamMap;
  facetSearch: FacetSearchState;
  onToggleValue: (key: string, value: string) => void;
  onOrphanChange: (next: boolean) => void;
  onFacetSearch: (key: string, term: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export interface FacetGroupProps {
  def: FacetDef;
  values: LibraryFacetValue[];
  selected: string[];
  searchTerm: string;
  onToggle: (value: string) => void;
  onSearch: (term: string) => void;
}

export interface FacetCheckboxRowProps {
  value: LibraryFacetValue;
  checked: boolean;
  onToggle: () => void;
}

export interface FacetSearchInputProps {
  value: string;
  label: string;
  onSearch: (term: string) => void;
}
