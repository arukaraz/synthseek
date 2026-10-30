"use client";

import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { HeatGrid, heatPeak, weekdayLabels } from "@components/MiniChart";
import { SegmentTabs } from "@components/ui/SegmentTabs";
import { WidgetFrame } from "@components/WidgetFrame";
import { useListeningClock } from "@hooks/api/queries/analytics/useListeningClock";
import type { ClockPeriod } from "@hooks/api/queries/analytics/types";
import { browserTimeZone } from "@utils/time-zone";

import { CLOCK_DEFAULT_PERIOD, CLOCK_PERIOD_KEYS, CLOCK_PERIODS } from "./constants";
import { clockFoot } from "./styles";

export function ListeningClockTile() {
  const { t } = useTranslation("settings");
  const [period, setPeriod] = useState<ClockPeriod>(CLOCK_DEFAULT_PERIOD);
  const [timeZone] = useState(browserTimeZone);
  const clock = useListeningClock(period, timeZone);
  const weekdays = weekdayLabels();
  const cells = clock.data?.cells ?? [];
  const peak = heatPeak(cells);

  return (
    <WidgetFrame
      icon={CalendarDays}
      title={t("overview.analytics.clock.title")}
      subtitle={t("overview.analytics.clock.subtitle")}
      info={t("overview.analytics.clock.info")}
      titleId="analytics-clock"
      loading={clock.isLoading}
      note={clock.isError ? t("overview.analytics.loadError") : null}
    >
      <HeatGrid
        cells={cells}
        weekdays={weekdays}
        label={t("overview.analytics.clock.chart")}
        cellTitle={(day, hour, count) => t("overview.analytics.clock.cell", { day, hour, count })}
        hourLabel={(hour) => t("overview.analytics.clock.hour", { hour })}
      />
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
    </WidgetFrame>
  );
}
