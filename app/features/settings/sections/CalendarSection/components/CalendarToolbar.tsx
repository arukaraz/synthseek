"use client";

import { CalendarDays, ChevronLeft, ChevronRight, List } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SegmentedControl } from "@components/ui/SegmentedControl";

import { monthLabel, shiftMonth } from "../helpers";
import { countText, toolbar, toolbarButton, toolbarEnd, toolbarGroup, toolbarMonth, todayButton } from "../styles";
import type { CalendarToolbarProps } from "./types";

export function CalendarToolbar({ month, view, count, onMonthChange, onToday, onViewChange }: CalendarToolbarProps) {
  const { t } = useTranslation("follows");

  return (
    <div className={toolbar()}>
      <div className={toolbarGroup()}>
        <button
          type="button"
          className={toolbarButton()}
          aria-label={t("releases.previousMonth")}
          onClick={() => onMonthChange(shiftMonth(month, -1))}
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <button
          type="button"
          className={toolbarButton()}
          aria-label={t("releases.nextMonth")}
          onClick={() => onMonthChange(shiftMonth(month, 1))}
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>
      <h2 className={toolbarMonth()}>{monthLabel(month)}</h2>
      <button type="button" className={todayButton()} onClick={onToday}>
        {t("releases.today")}
      </button>
      <div className={toolbarEnd()}>
        <span className={countText()}>{t("releases.count", { count })}</span>
        <SegmentedControl
          value={view}
          onChange={onViewChange}
          ariaLabel={t("releases.viewLabel")}
          glyphOnlyOnPhone
          options={[
            { value: "month", label: t("releases.viewMonth"), icon: CalendarDays },
            { value: "list", label: t("releases.viewList"), icon: List },
          ]}
        />
      </div>
    </div>
  );
}
