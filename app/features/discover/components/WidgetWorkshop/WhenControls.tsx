"use client";

import { useTranslation } from "react-i18next";

import { SelectMenu } from "@components/ui/SelectMenu";

import { MONTHS_IN_YEAR, NUMBER_BOUNDS, WHOLE_YEAR } from "./constants";
import { monthName, timeFor } from "./helpers";
import { NumberField } from "./NumberField";
import { stepText } from "./styles";
import type { WhenControlsProps } from "./types";

export function WhenControls({ time, modes, periods, limits, onChange }: WhenControlsProps) {
  const { t } = useTranslation("widgets");
  const modeSelect = (
    <SelectMenu
      ariaLabel={t("steps.when")}
      value={time.mode}
      options={modes.map((mode) => ({ value: mode, label: t(`timeModes.${mode}`) }))}
      onChange={(mode) => onChange(timeFor(mode, new Date()))}
    />
  );

  switch (time.mode) {
    case "relative":
    case "sameLastYear":
      return (
        <>
          {modeSelect}
          <NumberField
            label={t("time.days")}
            value={time.days}
            min={NUMBER_BOUNDS.daysMin}
            max={limits.daysMax}
            onChange={(days) => onChange({ ...time, days })}
          />
          <span className={stepText()}>{t("time.days")}</span>
        </>
      );
    case "named":
      return (
        <>
          {modeSelect}
          <SelectMenu
            ariaLabel={t("timeModes.named")}
            value={time.value}
            options={periods.map((period) => ({ value: period, label: t(`periods.${period}`) }))}
            onChange={(value) => onChange({ ...time, value })}
          />
        </>
      );
    case "absolute":
      return (
        <>
          {modeSelect}
          <NumberField
            label={t("timeModes.absolute")}
            value={time.year}
            min={limits.yearMin}
            max={limits.yearMax}
            onChange={(year) => onChange({ ...time, year })}
          />
          <SelectMenu
            ariaLabel={t("time.month")}
            value={time.month ?? WHOLE_YEAR}
            options={[
              { value: WHOLE_YEAR, label: t("time.wholeYear") },
              ...Array.from({ length: MONTHS_IN_YEAR }, (_, index) => ({
                value: index + 1,
                label: monthName(index + 1),
              })),
            ]}
            onChange={(month) =>
              onChange({ mode: "absolute", year: time.year, month: month === WHOLE_YEAR ? undefined : month })
            }
          />
        </>
      );
  }
}
