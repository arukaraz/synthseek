"use client";

import { useTranslation } from "react-i18next";

import { RequestStatus } from "@api/__generated__/types";
import { SelectMenu } from "@components/ui/SelectMenu";

import { DECADE_CHOICES, NUMBER_BOUNDS, RELEASE_TYPE_CHOICES, SHARE_PERCENT } from "./constants";
import { NumberField } from "./NumberField";
import { stepText } from "./styles";
import type { RuleControlsProps } from "./types";

export function RuleControls({ rule, limits, onChange }: RuleControlsProps) {
  const { t } = useTranslation(["widgets", "status", "discover"]);
  const opLabel = t("widgets:rules.op");
  const valueLabel = t("widgets:rules.value");
  const yesNo = [
    { value: "yes", label: t("widgets:rules.yes") },
    { value: "no", label: t("widgets:rules.no") },
  ] as const;
  const days = { min: NUMBER_BOUNDS.daysMin, max: limits.daysMax };

  switch (rule.field) {
    case "plays":
      return (
        <>
          <SelectMenu
            ariaLabel={opLabel}
            value={rule.op}
            options={[
              { value: "gte", label: t("widgets:rules.ops.gte") },
              { value: "lte", label: t("widgets:rules.ops.lte") },
            ]}
            onChange={(op) => onChange({ ...rule, op })}
          />
          <NumberField
            label={valueLabel}
            value={rule.value}
            {...NUMBER_BOUNDS.count}
            onChange={(value) => onChange({ ...rule, value })}
          />
        </>
      );
    case "notPlayedInLast":
    case "addedOlderThan":
      return (
        <>
          <NumberField
            label={valueLabel}
            value={rule.value}
            {...days}
            onChange={(value) => onChange({ ...rule, value })}
          />
          <span className={stepText()}>{t("widgets:rules.ops.days")}</span>
        </>
      );
    case "bitrate":
      return (
        <>
          <SelectMenu
            ariaLabel={opLabel}
            value={rule.op}
            options={[
              { value: "lt", label: t("widgets:rules.ops.lt") },
              { value: "gte", label: t("widgets:rules.ops.gte") },
            ]}
            onChange={(op) => onChange({ ...rule, op })}
          />
          <NumberField
            label={valueLabel}
            value={rule.value}
            {...NUMBER_BOUNDS.bitrate}
            onChange={(value) => onChange({ ...rule, value })}
          />
          <span className={stepText()}>{t("widgets:rules.kbps")}</span>
        </>
      );
    case "ownedShare":
      return (
        <>
          <SelectMenu
            ariaLabel={opLabel}
            value={rule.op}
            options={[
              { value: "lt", label: t("widgets:rules.ops.lt") },
              { value: "gte", label: t("widgets:rules.ops.gte") },
            ]}
            onChange={(op) => onChange({ ...rule, op })}
          />
          <NumberField
            label={valueLabel}
            value={Math.round(rule.value * SHARE_PERCENT)}
            {...NUMBER_BOUNDS.percent}
            onChange={(value) => onChange({ ...rule, value: value / SHARE_PERCENT })}
          />
          <span className={stepText()}>{t("widgets:rules.percent")}</span>
        </>
      );
    case "favorite":
    case "inLibrary":
    case "artistInLibrary":
      return (
        <SelectMenu
          ariaLabel={valueLabel}
          value={rule.value ? "yes" : "no"}
          options={yesNo}
          onChange={(choice) => onChange({ ...rule, value: choice === "yes" })}
        />
      );
    case "requestStatus":
      return (
        <SelectMenu
          ariaLabel={valueLabel}
          value={rule.value}
          options={RequestStatus.options.map((status) => ({
            value: status,
            label: t(`status:request.${status}.label`),
          }))}
          onChange={(value) => onChange({ ...rule, value })}
        />
      );
    case "genre":
      return (
        <>
          <span className={stepText()}>{t("widgets:rules.ops.inMyTop")}</span>
          <NumberField
            label={valueLabel}
            value={rule.value}
            min={NUMBER_BOUNDS.topNMin}
            max={limits.topNMax}
            onChange={(value) => onChange({ ...rule, value })}
          />
        </>
      );
    case "decade":
      return (
        <SelectMenu
          ariaLabel={valueLabel}
          value={String(rule.value)}
          options={[
            { value: "myTop", label: t("widgets:rules.myTop") },
            ...DECADE_CHOICES.map((year) => ({
              value: String(year),
              label: t("discover:customWidget.decade", { year }),
            })),
          ]}
          onChange={(choice) => onChange({ ...rule, value: choice === "myTop" ? "myTop" : Number(choice) })}
        />
      );
    case "artistInMyTop":
      return (
        <>
          <span className={stepText()}>{t("widgets:rules.topN")}</span>
          <NumberField
            label={t("widgets:rules.topN")}
            value={rule.value.n}
            min={NUMBER_BOUNDS.topNMin}
            max={limits.topNMax}
            onChange={(n) => onChange({ ...rule, value: { ...rule.value, n } })}
          />
          <span className={stepText()}>{t("widgets:rules.overDays")}</span>
          <NumberField
            label={t("widgets:rules.overDays")}
            value={rule.value.days}
            {...days}
            onChange={(value) => onChange({ ...rule, value: { ...rule.value, days: value } })}
          />
        </>
      );
    case "inCurrentTimeSlot":
      return null;
    case "releaseType":
      return (
        <>
          <SelectMenu
            ariaLabel={opLabel}
            value={rule.op}
            options={[
              { value: "is", label: t("widgets:rules.ops.is") },
              { value: "isNot", label: t("widgets:rules.ops.isNot") },
            ]}
            onChange={(op) => onChange({ ...rule, op })}
          />
          <SelectMenu
            ariaLabel={valueLabel}
            value={rule.value}
            options={RELEASE_TYPE_CHOICES.map((value) => ({ value, label: t(`widgets:rules.releaseTypes.${value}`) }))}
            onChange={(value) => onChange({ ...rule, value })}
          />
        </>
      );
    case "listeners":
      return (
        <>
          <SelectMenu
            ariaLabel={opLabel}
            value={rule.op}
            options={[
              { value: "lt", label: t("widgets:rules.ops.lt") },
              { value: "gte", label: t("widgets:rules.ops.gte") },
            ]}
            onChange={(op) => onChange({ ...rule, op })}
          />
          <NumberField
            label={valueLabel}
            value={rule.value}
            {...NUMBER_BOUNDS.listeners}
            onChange={(value) => onChange({ ...rule, value })}
          />
        </>
      );
  }
}
