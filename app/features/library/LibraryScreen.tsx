"use client";

import { useState } from "react";

import { AlbumsViewMode } from "./components/AlbumsViewMode";
import { ArtistsViewMode } from "./components/ArtistsViewMode";
import { LibraryToolbar } from "./components/LibraryToolbar/LibraryToolbar";
import { PlaylistsViewMode } from "./components/PlaylistsViewMode";
import { TracksViewMode } from "./components/TracksViewMode";
import { countActiveFilters } from "./helpers";
import { useLibrarySelection } from "./hooks/useLibrarySelection";
import { useLibraryUrlState } from "./hooks/useLibraryUrlState";
import { libraryBody, libraryScreen } from "./styles";
import type { LibraryView } from "./types";

export function LibraryScreen() {
  const controller = useLibraryUrlState();
  const selection = useLibrarySelection();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleViewChange = (view: LibraryView) => {
    selection.clear();
    controller.setTab(view);
  };

  const activeFilterCount = countActiveFilters(controller.filters);
  const viewProps = { controller, filtersOpen, onFiltersOpenChange: setFiltersOpen };

  return (
    <div className={libraryScreen()}>
      <div className="px-4 pt-4 sm:px-6">
        <LibraryToolbar
          controller={controller}
          searchValue={controller.search}
          searchPlaceholderKey={controller.config.searchPlaceholderKey}
          onSearchChange={controller.setSearch}
          onViewChange={handleViewChange}
          onOpenFilters={() => setFiltersOpen(true)}
          activeFilterCount={activeFilterCount}
        />
      </div>

      <div className={libraryBody()}>
        {controller.view === "tracks" ? <TracksViewMode {...viewProps} selection={selection} /> : null}
        {controller.view === "albums" ? <AlbumsViewMode {...viewProps} /> : null}
        {controller.view === "artists" ? <ArtistsViewMode {...viewProps} /> : null}
        {controller.view === "playlists" ? <PlaylistsViewMode {...viewProps} /> : null}
      </div>
    </div>
  );
}
