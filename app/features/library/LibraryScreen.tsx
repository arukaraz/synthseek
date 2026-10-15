"use client";

import type { LibraryAlbumItem } from "@hooks/api/queries/library/types";
import { useSelection } from "@hooks/ui/useSelection";
import { useState } from "react";

import { AlbumsViewMode } from "./components/AlbumsViewMode";
import { ArtistsViewMode } from "./components/ArtistsViewMode";
import { LibraryFileFlow } from "./components/LibraryFileFlow";
import { LibraryToolbar } from "./components/LibraryToolbar/LibraryToolbar";
import { PlaylistsViewMode } from "./components/PlaylistsViewMode";
import { TracksViewMode } from "./components/TracksViewMode";
import { countActiveFilters, spendsSelection } from "./helpers";
import { useLibraryFileRequest } from "./hooks/useLibraryFileRequest";
import { useLibrarySelection } from "./hooks/useLibrarySelection";
import { useLibraryUrlState } from "./hooks/useLibraryUrlState";
import { libraryBody, libraryScreen } from "./styles";
import type { LibraryView } from "./types";

export function LibraryScreen() {
  const controller = useLibraryUrlState();
  const trackSelection = useLibrarySelection();
  const albumSelection = useSelection<LibraryAlbumItem>();
  const fileRequest = useLibraryFileRequest();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const clearSelections = () => {
    trackSelection.clear();
    albumSelection.clear();
  };

  const handleViewChange = (view: LibraryView) => {
    clearSelections();
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
        {controller.view === "tracks" ? (
          <TracksViewMode {...viewProps} selection={trackSelection} fileActions={fileRequest.actions} />
        ) : null}
        {controller.view === "albums" ? (
          <AlbumsViewMode {...viewProps} selection={albumSelection} fileActions={fileRequest.actions} />
        ) : null}
        {controller.view === "artists" ? <ArtistsViewMode {...viewProps} /> : null}
        {controller.view === "playlists" ? <PlaylistsViewMode {...viewProps} /> : null}
      </div>

      <LibraryFileFlow
        {...fileRequest.flowProps}
        onStarted={(request) => {
          if (spendsSelection(request)) clearSelections();
        }}
      />
    </div>
  );
}
