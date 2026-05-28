"use client";

import { Check, Heart } from "lucide-react";

import { cn } from "@utils/cn";

import { formatLastSync, libraryTypeLabel, libraryTypeTone } from "../helpers";
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
  const importedTone = imported ? "imported" : "disabled";
  const importedLabel = imported ? "Enabled" : "Disabled";

  return (
    <tr className={tableRow({ selected, focused })} onClick={onClick}>
      <td
        className="pl-4 pr-2 py-2"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect();
        }}
      >
        <span className={checkBox({ on: selected })} aria-label={selected ? "Deselect" : "Select"}>
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
      <td className={tableCell()}>
        <span className={typeTag({ tone: libraryTypeTone(item.type) })}>{libraryTypeLabel(item.type)}</span>
      </td>
      <td className={tableCellMono()}>{item.totalTracks}</td>
      <td className={tableCell()}>
        <span className={stPill({ tone: importedTone })}>
          <span className={stDot({ tone: importedTone })} />
          {importedLabel}
        </span>
      </td>
      <td className={imported && item.lastSyncedAt ? tableCellMono() : tableCellMonoDim()}>
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
          {syncEnabled ? "Enabled" : "Disabled"}
        </button>
      </td>
    </tr>
  );
}
