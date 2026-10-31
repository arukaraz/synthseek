"use client";

import { useTranslation } from "react-i18next";

import { Checkbox } from "@components/ui/Checkbox";
import { SegmentedControl } from "@components/ui/SegmentedControl";

import { NumberField } from "../NumberField";
import { StepRow } from "../StepRow";
import { compareField, stepText } from "../styles";
import { line, stack } from "./styles";
import type { SetOutside, SetStepProps } from "./types";

export function SetOutsideStep({ set, grammar, onChange }: SetStepProps) {
  const { t } = useTranslation("widgets");
  const { mode, share, expireWeeks } = set.outside;
  const { limits } = grammar;
  const update = (patch: Partial<SetOutside>) =>
    onChange((current) => ({ ...current, outside: { ...current.outside, ...patch } }));

  return (
    <StepRow label={t("set.outside")} flush>
      <div className={stack()}>
        <div className={line()}>
          <SegmentedControl
            ariaLabel={t("set.outside")}
            value={mode}
            options={grammar.outsideModes.map((entry) => ({ value: entry, label: t(`set.outsideModes.${entry}`) }))}
            onChange={(next) => update({ mode: next })}
          />
        </div>
        {mode === "library" ? null : (
          <div className={line()}>
            <span className={stepText()}>{t("set.upTo")}</span>
            <NumberField
              label={t("set.shareLabel")}
              value={share}
              min={limits.shareMin}
              max={limits.shareMax}
              onChange={(value) => update({ share: value })}
            />
            <span className={stepText()}>{t(mode === "suggest" ? "set.shareSuggest" : "set.shareDownload")}</span>
          </div>
        )}
        {mode === "download" ? (
          <div className={line()}>
            <label className={compareField()}>
              <Checkbox
                checked={expireWeeks !== null}
                onCheckedChange={(checked) =>
                  update({ expireWeeks: checked === true ? limits.expireWeeksDefault : null })
                }
              />
              {t("set.expire")}
            </label>
            {expireWeeks === null ? null : (
              <>
                <span className={stepText()}>{t("set.after")}</span>
                <NumberField
                  label={t("set.expireWeeks")}
                  value={expireWeeks}
                  min={1}
                  max={limits.expireWeeksMax}
                  onChange={(value) => update({ expireWeeks: value })}
                />
                <span className={stepText()}>{t("set.expireTail")}</span>
              </>
            )}
          </div>
        ) : null}
      </div>
    </StepRow>
  );
}
