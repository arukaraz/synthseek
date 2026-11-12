"use client";

import type { LibraryAlbumItem } from "@hooks/api/queries/library/types";
import { PHONE_QUERY } from "@hooks/ui/constants";
import { useLocalStorage } from "@hooks/ui/useLocalStorage";
import { useMediaQuery } from "@hooks/ui/useMediaQuery";
import { useSelection } from "@hooks/ui/useSelection";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { useState } from "react";

import { AlbumsViewMode } from "./components/AlbumsViewMode";
import { ArtistsViewMode } from "./components/ArtistsViewMode";
import { LibraryFileFlow } from "./components/LibraryFileFlow";
import { LibraryToolbar } from "./components/LibraryToolbar/LibraryToolbar";
import { PlaylistsViewMode } from "./components/PlaylistsViewMode";
import { TracksViewMode } from "./components/TracksViewMode";
import { LIBRARY_DENSITY_STORAGE_KEY } from "./constants";
import { countActiveFilters, isLibraryDensity, spendsSelection } from "./helpers";
import { useLibraryFileRequest } from "./hooks/useLibraryFileRequest";
import { useLibrarySelection } from "./hooks/useLibrarySelection";
import { useLibraryUrlState } from "./hooks/useLibraryUrlState";
import { libraryBody, libraryScreen, libraryToolbarRow } from "./styles";
import type { LibraryView, LibraryViewShell } from "./types";

export function LibraryScreen() {
  const controller = useLibraryUrlState();
  const trackSelection = useLibrarySelection();
  const albumSelection = useSelection<LibraryAlbumItem>();
  const fileRequest = useLibraryFileRequest();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [storedDensity, setDensity] = useLocalStorage(LIBRARY_DENSITY_STORAGE_KEY, "comfortable", isLibraryDensity);
  const density = isLibraryDensity(storedDensity) ? storedDensity : "comfortable";
  const phone = useMediaQuery(PHONE_QUERY);
  const { isAdmin } = useAuthContext();
  const [selectMode, setSelectMode] = useState(false);

  const clearSelections = () => {
    trackSelection.clear();
    albumSelection.clear();
  };

  const handleSelectModeChange = (on: boolean) => {
    if (!on) clearSelections();
    setSelectMode(on);
  };

  const handleViewChange = (view: LibraryView) => {
    clearSelections();
    setSelectMode(false);
    controller.setTab(view);
  };

  const activeFilterCount = countActiveFilters(controller.filters);
  const shell: LibraryViewShell = {
    filtersOpen,
    onFiltersOpenChange: setFiltersOpen,
    onViewChange: handleViewChange,
    density,
    onDensityChange: setDensity,
    phone,
    admin: isAdmin,
    selectMode: phone && selectMode,
    onSelectModeChange: handleSelectModeChange,
  };
  const viewProps = { controller, shell };

  return (
    <div className={libraryScreen()}>
      <div className={libraryToolbarRow()}>
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
