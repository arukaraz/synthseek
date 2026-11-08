"use client";

import { useTranslation } from "react-i18next";

import { LibraryTrackRow } from "./LibraryTrackRow";
import { trackRowList } from "./styles";
import type { LibraryTrackRowsProps } from "./types";

export function LibraryTrackRows({
  items,
  selection,
  selecting,
  onPlay,
  onEnqueue,
  onSearchBetterQuality,
  fileActions,
}: LibraryTrackRowsProps) {
  const { t } = useTranslation("library");

  return (
    <ul className={trackRowList()} aria-label={t("page.tabs.tracks")}>
      {items.map((item) => (
        <LibraryTrackRow
          key={item.id}
          item={item}
          selecting={selecting}
          selected={selection.isSelected(item.id)}
          onToggle={() => selection.toggle(item.id)}
          onPlay={onPlay}
          onEnqueue={onEnqueue}
          onSearchBetterQuality={onSearchBetterQuality}
          fileActions={fileActions}
        />
      ))}
    </ul>
  );
}
