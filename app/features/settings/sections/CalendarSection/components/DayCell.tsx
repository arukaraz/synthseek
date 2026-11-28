"use client";

import { useTranslation } from "react-i18next";

import { Popover, PopoverAnchor, PopoverContent } from "@components/ui/Popover";

import { CHIPS_PER_DAY, DOTS_PER_DAY } from "../constants";
import { fullDateLabel } from "../helpers";
import { chipList, dayCell, dayNumber, dot, dotRow, moreButton } from "../styles";
import { DayPanel } from "./DayPanel";
import { ReleaseChip } from "./ReleaseChip";
import type { DayCellProps } from "./types";

export function DayCell({
  day,
  active,
  selected,
  compact,
  popover,
  today,
  open,
  onKeyDown,
  onFocusDay,
  onOpen,
  onClose,
}: DayCellProps) {
  const { t } = useTranslation("follows");
  const count = day.releases.length;
  const date = fullDateLabel(day.iso);
  const label = day.isToday ? t("releases.cellToday", { date, count }) : t("releases.cell", { date, count });
  const isOpen = open !== null && open.iso === day.iso;
  const shown = day.releases.slice(0, CHIPS_PER_DAY);
  const hidden = count - shown.length;

  const cell = (
    <div
      role="gridcell"
      data-iso={day.iso}
      tabIndex={active ? 0 : -1}
      aria-label={label}
      aria-selected={selected}
      aria-current={day.isToday ? "date" : undefined}
      className={dayCell({ inMonth: day.inMonth, selected, compact })}
      onFocus={() => onFocusDay(day.iso)}
      onKeyDown={(event) => {
        onKeyDown(event, day.iso);
        if (event.target !== event.currentTarget) return;
        if ((event.key === "Enter" || event.key === " ") && day.inMonth) {
          event.preventDefault();
          onOpen(day.iso, null);
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && day.inMonth) onOpen(day.iso, null);
      }}
    >
      <span className={dayNumber({ today: day.isToday })} aria-hidden>
        {day.day}
      </span>
      {compact ? (
        count > 0 ? (
          <span className={dotRow()} aria-hidden>
            {day.releases.slice(0, DOTS_PER_DAY).map((release) => (
              <span key={release.releaseId} className={dot()} />
            ))}
          </span>
        ) : null
      ) : (
        <span className={chipList()}>
          {shown.map((release) => (
            <ReleaseChip key={release.releaseId} release={release} iso={day.iso} onOpen={onOpen} />
          ))}
          {hidden > 0 ? (
            <button type="button" tabIndex={-1} className={moreButton()} onClick={() => onOpen(day.iso, null)}>
              {t("releases.more", { count: hidden })}
            </button>
          ) : null}
        </span>
      )}
    </div>
  );

  if (!popover) return cell;

  return (
    <Popover open={isOpen} onOpenChange={(next) => (next ? undefined : onClose())}>
      <PopoverAnchor asChild>{cell}</PopoverAnchor>
      <PopoverContent align="start" className="max-w-none p-3" aria-label={label}>
        <DayPanel iso={day.iso} releaseId={open?.releaseId ?? null} releases={day.releases} today={today} />
      </PopoverContent>
    </Popover>
  );
}
