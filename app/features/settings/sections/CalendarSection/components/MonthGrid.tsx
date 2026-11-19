"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { BottomSheet, BottomSheetHeader, bottomSheetBody } from "@components/ui/BottomSheet";
import { PHONE_QUERY } from "@hooks/ui/constants";
import { useMediaQuery } from "@hooks/ui/useMediaQuery";

import { COMPACT_GRID_MAX_WIDTH } from "../constants";
import { buildMonthGrid, fullDateLabel, monthLabel, weekdayLabel } from "../helpers";
import { useGridFocus } from "../hooks/useGridFocus";
import { gridHeaderCell, gridHeaderRow, gridRoot, gridWeek, hintText, srOnly, calendarStack } from "../styles";
import { DayCell } from "./DayCell";
import { DayPanel } from "./DayPanel";
import { ReleaseCards } from "./ReleaseCards";
import type { MonthGridProps } from "./types";

export function MonthGrid({ month, firstDay, releases, today, width, onMonthChange }: MonthGridProps) {
  const { t } = useTranslation("follows");
  const phone = useMediaQuery(PHONE_QUERY);
  const [open, setOpen] = useState<{ iso: string; releaseId: string | null } | null>(null);
  const compact = width > 0 && width < COMPACT_GRID_MAX_WIDTH;
  const headerWidth = compact ? "short" : "long";
  const grid = useMemo(
    () => buildMonthGrid({ ref: month, firstDay, releases, today }),
    [month, firstDay, releases, today]
  );
  const { containerRef, activeIso, onKeyDown, setFocusIso } = useGridFocus({
    ref: month,
    firstDay,
    today,
    grid,
    onMonthChange,
  });
  const selectedDay = grid.flat().find((day) => day.iso === activeIso);
  const total = grid.flat().reduce((sum, day) => sum + day.releases.length, 0);

  const handleOpen = (iso: string, releaseId: string | null) => {
    setFocusIso(iso);
    if (!compact) setOpen({ iso, releaseId });
  };

  const sheetDay = open === null ? undefined : grid.flat().find((day) => day.iso === open.iso);

  return (
    <div className={calendarStack()}>
      <div ref={containerRef} role="grid" aria-label={t("releases.gridLabel")} className={gridRoot()}>
        <div role="row" className={gridHeaderRow()}>
          {(grid[0] ?? []).map((day) => (
            <div key={day.iso} role="columnheader" className={gridHeaderCell()}>
              {weekdayLabel(day.iso, headerWidth)}
            </div>
          ))}
        </div>
        {grid.map((week) => (
          <div key={week[0]?.iso} role="row" className={gridWeek()}>
            {week.map((day) => (
              <DayCell
                key={day.iso}
                day={day}
                active={day.iso === activeIso}
                selected={compact && day.iso === activeIso}
                compact={compact}
                popover={!compact && !phone}
                today={today}
                open={open}
                onKeyDown={onKeyDown}
                onFocusDay={setFocusIso}
                onOpen={handleOpen}
                onClose={() => setOpen(null)}
              />
            ))}
          </div>
        ))}
      </div>
      <div className={srOnly()} role="status" aria-live="polite">
        {t("releases.announce", { month: monthLabel(month), count: total })}
      </div>
      {compact && selectedDay ? (
        <section aria-label={t("releases.selectedDay", { date: fullDateLabel(selectedDay.iso) })}>
          <h3 className={hintText()}>{t("releases.selectedDay", { date: fullDateLabel(selectedDay.iso) })}</h3>
          {selectedDay.releases.length === 0 ? (
            <p className={hintText()}>{t("releases.noneOnDay")}</p>
          ) : (
            <ReleaseCards releases={selectedDay.releases} today={today} />
          )}
        </section>
      ) : null}
      {phone && !compact ? (
        <BottomSheet open={open !== null} onOpenChange={(next) => (next ? undefined : setOpen(null))} size="compact">
          {open !== null && sheetDay ? (
            <>
              <BottomSheetHeader title={t("releases.dayTitle", { date: fullDateLabel(open.iso) })} />
              <div className={bottomSheetBody()}>
                <DayPanel
                  iso={open.iso}
                  releaseId={open.releaseId}
                  releases={sheetDay.releases}
                  today={today}
                  showTitle={false}
                />
              </div>
            </>
          ) : null}
        </BottomSheet>
      ) : null}
    </div>
  );
}
