"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { useFollowCalendar } from "@hooks/api/queries/artist-follow/useFollowCalendar";
import { useFollowedTotal } from "@hooks/api/queries/artist-follow/useFollowedTotal";
import { useElementWidth } from "@hooks/ui/useElementWidth";
import { useLocalStorage } from "@hooks/ui/useLocalStorage";
import { useUrlParam } from "@hooks/ui/useUrlParam";

import { MostPlayedDialog } from "../../components/MostPlayedDialog";
import { CalendarEmpty } from "./components/CalendarEmpty";
import { CalendarToolbar } from "./components/CalendarToolbar";
import { LastChecked } from "./components/LastChecked";
import { MonthGrid } from "./components/MonthGrid";
import { ReleaseAgenda } from "./components/ReleaseAgenda";
import { ReleaseTypesStrip } from "./components/ReleaseTypesStrip";
import { CALENDAR_VIEW_STORAGE_KEY, DEFAULT_CALENDAR_VIEW, MONTH_PARAM } from "./constants";
import {
  currentMonthOf,
  firstWeekday,
  groupByDay,
  isCalendarView,
  monthBounds,
  monthKey,
  monthLabel,
  parseMonthParam,
} from "./helpers";
import { calendarStack, hintText, placeholderGrid, statusBox, typesStrip } from "./styles";
import type { CalendarView, MonthRef } from "./types";

export function ReleasesSection() {
  const { t, i18n } = useTranslation("follows");
  const [rawMonth, setRawMonth] = useUrlParam(MONTH_PARAM);
  const [rawView, setView] = useLocalStorage(CALENDAR_VIEW_STORAGE_KEY, DEFAULT_CALENDAR_VIEW, isCalendarView);
  const [measure, width] = useElementWidth<HTMLDivElement>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fallbackToday] = useState(() => new Date());

  const view: CalendarView = isCalendarView(rawView) ? rawView : DEFAULT_CALENDAR_VIEW;
  const firstDay = useMemo(() => firstWeekday(i18n.language), [i18n.language]);

  const month: MonthRef = parseMonthParam(rawMonth) ?? currentMonthOf(fallbackToday);
  const calendar = useFollowCalendar(monthBounds(month));
  const followedTotal = useFollowedTotal();

  const today = calendar.data?.today ?? null;
  const releases = useMemo(() => calendar.data?.items ?? [], [calendar.data]);
  const groups = useMemo(() => groupByDay(releases), [releases]);
  const noFollows = followedTotal === 0;

  const changeMonth = (next: MonthRef) => setRawMonth(monthKey(next));
  const goToday = () => setRawMonth(null);

  return (
    <div ref={measure} className={calendarStack()}>
      <ReleaseTypesStrip />
      {noFollows ? (
        <CalendarEmpty onFollowMostPlayed={() => setDialogOpen(true)} />
      ) : (
        <>
          <CalendarToolbar
            month={month}
            view={view}
            count={releases.length}
            onMonthChange={changeMonth}
            onToday={goToday}
            onViewChange={setView}
          />
          {calendar.isError ? (
            <div className={statusBox()} role="alert">
              <p className={hintText()}>{t("releases.loadError")}</p>
              <Button variant="secondary" size="sm" onClick={() => void calendar.refetch()}>
                {t("releases.retry")}
              </Button>
            </div>
          ) : calendar.data === undefined ? (
            <div className={placeholderGrid()} role="status" aria-label={t("releases.loading")} />
          ) : view === "month" ? (
            <MonthGrid
              month={month}
              firstDay={firstDay}
              releases={releases}
              today={today}
              width={width}
              onMonthChange={changeMonth}
            />
          ) : groups.length === 0 ? (
            <p className={hintText()}>{t("releases.emptyMonth", { month: monthLabel(month) })}</p>
          ) : (
            <ReleaseAgenda groups={groups} today={today} month={month} width={width} />
          )}
          <div className={typesStrip()}>
            <LastChecked lastCheckedAt={calendar.data?.lastCheckedAt ?? null} />
          </div>
        </>
      )}
      <MostPlayedDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
