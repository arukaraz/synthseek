"use client";

import { albumRequestItem } from "@features/content-detail";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { useLibraryAlbums } from "@hooks/api";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { useRangePreview } from "@hooks/ui/useRangePreview";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { VIEW_CONFIG } from "../constants";
import {
  applySelectionShortcut,
  buildAlbumsInput,
  rangePreviewTone,
  shellCardChrome,
  shellListsRows,
} from "../helpers";
import type { AlbumsViewModeProps } from "../types";
import { AlbumCard, AlbumCardMenu, AlbumSelectionBar, CardArtwork, LibraryListRow } from "./LibraryCard";
import { joinMeta } from "./LibraryCard/helpers";
import type { CardSelection } from "./LibraryCard/types";
import type { LibraryAlbumItem, PlayableTracksTarget } from "@hooks/api/queries/library/types";
import { LibraryViewLayout } from "./LibraryViewLayout/LibraryViewLayout";

export function AlbumsViewMode({ controller, shell, selection, fileActions }: AlbumsViewModeProps) {
  const { t } = useTranslation(["library", "contentDetail"]);
  const { openForResult } = useContentRequestFlow();
  const { playEntity, enqueueEntity, enqueueEntities } = useEntityPlayback();
  const { previewId, trackRow } = useRangePreview();
  const input = useMemo(
    () =>
      buildAlbumsInput({
        q: controller.search || undefined,
        sort: controller.sort,
        direction: controller.direction,
        filters: controller.filters,
        facetSearch: controller.facetSearch,
      }),
    [controller.search, controller.sort, controller.direction, controller.filters, controller.facetSearch]
  );

  const query = useLibraryAlbums(input, controller.view === "albums");

  const items = useMemo(() => query.items ?? [], [query.items]);
  const orderedIds = useMemo(() => items.map((item) => item.id), [items]);
  const preview = previewId ? selection.rangeTo(orderedIds, previewId) : null;
  const previewTone = rangePreviewTone(preview);
  const selecting = selection.selectedCount > 0 || shell.selectMode;
  const showLibraryPaths = (query.facets.libraryPath ?? []).length > 1;
  const chrome = shellCardChrome(shell);
  const asRows = shellListsRows(shell);
  const selectable = !shell.phone || shell.selectMode;

  const enqueueAlbums = useCallback(
    (albums: LibraryAlbumItem[]) =>
      enqueueEntities(
        albums.map((album): PlayableTracksTarget => ({ kind: "album", albumExternalId: album.external_id }))
      ),
    [enqueueEntities]
  );

  const renderCard = useCallback(
    (item: LibraryAlbumItem) => {
      const open = () =>
        openForResult(
          albumRequestItem({
            id: item.external_id,
            name: item.name,
            artistName: item.artist,
            cover: item.album_art,
            genres: item.genres,
          })
        );
      const menu = (
        <AlbumCardMenu
          item={item}
          onEnqueue={() => void enqueueEntity({ kind: "album", albumExternalId: item.external_id })}
          fileActions={fileActions}
          appearance={chrome === "overlay" ? "cover" : "inline"}
        />
      );
      const cardSelection: CardSelection | undefined = selectable
        ? {
            selected: selection.isSelected(item.id),
            selecting,
            preview: preview?.ids.includes(item.id) ? previewTone : "none",
            onToggle: (extend: boolean) =>
              extend ? selection.extendTo(orderedIds, item.id) : selection.toggle(item.id),
            onHover: (hovered: boolean) => trackRow(hovered ? item.id : null),
          }
        : undefined;
      const onHold =
        shell.phone && !shell.selectMode
          ? () => {
              shell.onSelectModeChange(true);
              selection.toggle(item.id);
            }
          : undefined;

      if (asRows) {
        return (
          <LibraryListRow
            title={item.name}
            subtitle={joinMeta([item.artist, item.year])}
            openLabel={t("contentDetail:openDetail", { name: item.name })}
            selectLabel={t("library:page.selection.selectAlbum", { name: item.name })}
            artwork={<CardArtwork src={item.album_art} name={item.name} sizes="56px" />}
            onOpen={open}
            trailing={menu}
            selection={cardSelection}
            onHold={onHold}
          />
        );
      }

      return (
        <AlbumCard
          item={item}
          showLibraryPaths={showLibraryPaths}
          chrome={chrome}
          onPlay={
            chrome === "bare" ? undefined : () => playEntity({ kind: "album", albumExternalId: item.external_id })
          }
          onOpen={open}
          menu={chrome === "bare" ? undefined : menu}
          selection={cardSelection}
          onHold={onHold}
        />
      );
    },
    [
      t,
      openForResult,
      playEntity,
      enqueueEntity,
      fileActions,
      selection,
      selecting,
      selectable,
      preview,
      previewTone,
      orderedIds,
      trackRow,
      showLibraryPaths,
      chrome,
      asRows,
      shell,
    ]
  );

  return (
    <LibraryViewLayout
      controller={controller}
      items={query.items}
      total={query.total}
      facets={query.facets}
      isLoading={query.isLoading}
      isError={query.isError}
      content={{
        layout: "grid",
        renderCard,
        getCardId: VIEW_CONFIG.albums.getCardId,
        hasNextPage: query.hasNextPage,
        isFetchingNextPage: query.isFetchingNextPage,
        fetchNextPage: query.fetchNextPage,
        bulkBar: (
          <AlbumSelectionBar items={items} selection={selection} fileActions={fileActions} onEnqueue={enqueueAlbums} />
        ),
        onKeyDown: (event) => {
          applySelectionShortcut(event, selection, orderedIds);
        },
      }}
      shell={shell}
    />
  );
}
