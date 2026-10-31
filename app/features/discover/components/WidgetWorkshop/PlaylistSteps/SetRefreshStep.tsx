"use client";

import { useTranslation } from "react-i18next";

import { Input } from "@components/ui/Input";
import { SelectMenu } from "@components/ui/SelectMenu";

import { NumberField } from "../NumberField";
import { StepRow } from "../StepRow";
import { stepText } from "../styles";
import { WEEK_DAYS } from "./constants";
import { clockFrom, clockValue, nextRunText, weekdayName, withDayToggled } from "./helpers";
import { clockInput, dayChip, dayRow, hint, line, stack } from "./styles";
import type { SetRefresh, SetResultStepProps } from "./types";

export function SetRefreshStep({ set, grammar, result, onChange }: SetResultStepProps) {
  const { t } = useTranslation("widgets");
  const { refresh } = set;
  const update = (patch: Partial<SetRefresh>) =>
    onChange((current) => ({ ...current, refresh: { ...current.refresh, ...patch } }));
  const weekly = refresh.every === "weekly" || refresh.every === "biweekly";

  return (
    <StepRow label={t("set.refresh")} flush>
      <div className={stack()}>
        <div className={line()}>
          <SelectMenu
            ariaLabel={t("set.refresh")}
            value={refresh.every}
            options={grammar.cadences.map((every) => ({ value: every, label: t(`set.cadences.${every}`) }))}
            onChange={(every) => update({ every })}
          />
          {weekly ? (
            <span className={dayRow()} role="group" aria-label={t("set.days")}>
              {WEEK_DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  aria-pressed={refresh.days.includes(day)}
                  className={dayChip({ selected: refresh.days.includes(day) })}
                  onClick={() => update({ days: withDayToggled(refresh.days, day) })}
                >
                  {weekdayName(day)}
                </button>
              ))}
            </span>
          ) : null}
          {refresh.every === "monthly" ? (
            <>
              <span className={stepText()}>{t("set.onDay")}</span>
              <NumberField
                label={t("set.dayOfMonth")}
                value={refresh.dayOfMonth}
                min={1}
                max={grammar.limits.dayOfMonthMax}
                onChange={(dayOfMonth) => update({ dayOfMonth })}
              />
            </>
          ) : null}
          {refresh.every === "manual" ? null : (
            <>
              <span className={stepText()}>{t("set.at")}</span>
              <Input
                type="time"
                aria-label={t("set.time")}
                className={clockInput()}
                value={clockValue(refresh)}
                onChange={(event) => {
                  const clock = clockFrom(event.target.value);
                  if (clock) update(clock);
                }}
              />
            </>
          )}
        </div>
        <span className={hint()}>{t("set.refreshHint", { next: nextRunText(result?.nextAt ?? null) })}</span>
      </div>
    </StepRow>
  );
}
