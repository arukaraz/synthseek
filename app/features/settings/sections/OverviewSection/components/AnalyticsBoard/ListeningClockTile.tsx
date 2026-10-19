"use client";

import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { SegmentTabs } from "@components/ui/SegmentTabs";
import { useListeningClock } from "@hooks/api/queries/analytics/useListeningClock";
import type { ClockPeriod } from "@hooks/api/queries/analytics/types";

import { AnalyticsTile } from "./AnalyticsTile";
import { CLOCK_DEFAULT_PERIOD, CLOCK_PERIOD_KEYS, CLOCK_PERIODS } from "./constants";
import { browserTimeZone, clockPeak, weekdayLabels } from "./helpers";
import { HeatGrid } from "./HeatGrid";
import { clockFoot } from "./styles";

export function ListeningClockTile() {
  const { t } = useTranslation("settings");
  const [period, setPeriod] = useState<ClockPeriod>(CLOCK_DEFAULT_PERIOD);
  const [timeZone] = useState(browserTimeZone);
  const clock = useListeningClock(period, timeZone);
  const weekdays = weekdayLabels();
  const cells = clock.data?.cells ?? [];
  const peak = clockPeak(cells);

  return (
    <AnalyticsTile
      icon={CalendarDays}
      title={t("overview.analytics.clock.title")}
      subtitle={t("overview.analytics.clock.subtitle")}
      info={t("overview.analytics.clock.info")}
      titleId="analytics-clock"
      loading={clock.isLoading}
      note={clock.isError ? t("overview.analytics.loadError") : null}
    >
      <HeatGrid cells={cells} weekdays={weekdays} />
      <div className={clockFoot()}>
        <span>
          {peak
            ? t("overview.analytics.clock.peak", {
                day: weekdays[peak.day],
                hour: peak.hour,
                count: clock.data?.total ?? 0,
              })
            : t("overview.analytics.clock.empty")}
        </span>
        <SegmentTabs
          items={CLOCK_PERIODS.map((value) => ({ value, label: t(CLOCK_PERIOD_KEYS[value]) }))}
          value={period}
          onValueChange={setPeriod}
          layoutId="analytics-clock-period"
          ariaLabel={t("overview.analytics.clock.periodLabel")}
        />
      </div>
    </AnalyticsTile>
  );
}
