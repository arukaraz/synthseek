"use client";

import { useTranslation } from "react-i18next";

import { ListPositionContext } from "@hooks/ui/useListPosition";
import { listPositionOf } from "@utils/list-position";

import { LibraryTrackRow } from "./LibraryTrackRow";
import { trackRowList } from "./styles";
import type { LibraryTrackRowsProps } from "./types";

export function LibraryTrackRows({
  items,
  total = items.length,
  selection,
  selecting,
  onPlay,
  onEnqueue,
  onSearchBetterQuality,
  fileActions,
  onHold,
}: LibraryTrackRowsProps) {
  const { t } = useTranslation("library");

  return (
    <ul className={trackRowList()} aria-label={t("page.tabs.tracks")}>
      {items.map((item, index) => (
        <ListPositionContext.Provider key={item.id} value={listPositionOf(index, total)}>
          <LibraryTrackRow
            item={item}
            selecting={selecting}
            selected={selection.isSelected(item.id)}
            onToggle={() => selection.toggle(item.id)}
            onPlay={onPlay}
            onEnqueue={onEnqueue}
            onSearchBetterQuality={onSearchBetterQuality}
            fileActions={fileActions}
            onHold={onHold ? () => onHold(item.id) : undefined}
          />
        </ListPositionContext.Provider>
      ))}
    </ul>
  );
}
