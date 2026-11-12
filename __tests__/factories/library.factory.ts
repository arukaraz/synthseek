import { vi } from "vitest";

import { VIEW_CONFIG } from "@features/library/constants";
import type { LibraryUrlController } from "@features/library/hooks/useLibraryUrlState";
import type { LibraryViewShell } from "@features/library/types";

export const createLibraryShell = (overrides: Partial<LibraryViewShell> = {}): LibraryViewShell => ({
  filtersOpen: false,
  onFiltersOpenChange: vi.fn(),
  onViewChange: vi.fn(),
  density: "comfortable",
  onDensityChange: vi.fn(),
  phone: false,
  admin: false,
  selectMode: false,
  onSelectModeChange: vi.fn(),
  ...overrides,
});

export const createLibraryController = (overrides: Partial<LibraryUrlController> = {}): LibraryUrlController => ({
  view: "tracks",
  config: VIEW_CONFIG.tracks,
  search: "",
  sort: "recent",
  direction: undefined,
  effectiveDirection: "desc",
  filters: {},
  facetSearch: {},
  setTab: vi.fn(),
  setSearch: vi.fn(),
  setSort: vi.fn(),
  setDir: vi.fn(),
  setFilterValues: vi.fn(),
  setOrphan: vi.fn(),
  setFacetSearch: vi.fn(),
  clearFilters: vi.fn(),
  ...overrides,
});
