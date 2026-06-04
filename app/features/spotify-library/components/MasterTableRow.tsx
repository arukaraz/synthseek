"use client";

import { Check, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@utils/cn";

import { formatLastSync, libraryTypeTone } from "../helpers";
import {
  checkBox,
  coverPlaceholder,
  coverThumb,
  heartThumb,
  stDot,
  stPill,
  syncDot,
  syncPill,
  tableCell,
  tableCellMono,
  tableCellMonoDim,
  tableCellName,
  tableRow,
  typeTag,
} from "../styles";
import type { MasterTableRowProps } from "./types";

export function MasterTableRow({
  item,
  selected,
  focused,
  imported,
  syncEnabled,
  onClick,
  onToggleSelect,
  onToggleSync,
}: MasterTableRowProps) {
  const { t } = useTranslation("library");
  const importedTone = imported ? "imported" : "disabled";
  const importedLabel = imported ? t("spotifyLibrary.row.enabled") : t("spotifyLibrary.row.disabled");

  return (
    <tr className={tableRow({ selected, focused })} onClick={onClick} data-master-row-id={item.id}>
      <td
        className="py-2 pr-2 pl-4"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect();
        }}
      >
        <span
          className={checkBox({ on: selected })}
          aria-label={selected ? t("spotifyLibrary.row.deselect") : t("spotifyLibrary.row.select")}
        >
          {selected && <Check className="size-3" strokeWidth={3} />}
        </span>
      </td>
      <td className={tableCellName()}>
        {item.type === "liked" ? (
          <span className={heartThumb()}>
            <Heart className="size-3.5" />
          </span>
        ) : item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt="" className={cn(coverThumb(), "object-cover")} />
        ) : (
          <span className={coverPlaceholder()} aria-hidden />
        )}
        <span className="truncate">{item.name}</span>
      </td>
      <td className={cn(tableCell(), "hidden sm:table-cell")}>
        <span className={typeTag({ tone: libraryTypeTone(item.type) })}>{t(`spotifyLibrary.type.${item.type}`)}</span>
      </td>
      <td className={cn(tableCellMono(), "hidden md:table-cell")}>{item.totalTracks}</td>
      <td className={cn(tableCell(), "hidden lg:table-cell")}>
        <span className={stPill({ tone: importedTone })}>
          <span className={stDot({ tone: importedTone })} />
          {importedLabel}
        </span>
      </td>
      <td className={cn(imported && item.lastSyncedAt ? tableCellMono() : tableCellMonoDim(), "hidden lg:table-cell")}>
        {imported ? formatLastSync(item.lastSyncedAt) : "—"}
      </td>
      <td className="px-3 py-2 text-center">
        <button
          type="button"
          className={syncPill({ on: syncEnabled })}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSync();
          }}
          aria-pressed={syncEnabled}
        >
          <span className={syncDot({ on: syncEnabled })} />
          {syncEnabled ? t("spotifyLibrary.row.enabled") : t("spotifyLibrary.row.disabled")}
        </button>
      </td>
    </tr>
  );
}
