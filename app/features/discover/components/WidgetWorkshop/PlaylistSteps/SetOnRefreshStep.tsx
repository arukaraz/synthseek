"use client";

import { useTranslation } from "react-i18next";

import { SegmentedControl } from "@components/ui/SegmentedControl";

import { NumberField } from "../NumberField";
import { StepRow } from "../StepRow";
import { stepText } from "../styles";
import { hint, line, stack } from "./styles";
import type { SetOnRefresh, SetStepProps } from "./types";

export function SetOnRefreshStep({ set, grammar, onChange }: SetStepProps) {
  const { t } = useTranslation("widgets");
  const { mode, keep } = set.onRefresh;
  const update = (patch: Partial<SetOnRefresh>) =>
    onChange((current) => ({ ...current, onRefresh: { ...current.onRefresh, ...patch } }));

  return (
    <StepRow label={t("set.onRefresh")} flush>
      <div className={stack()}>
        <div className={line()}>
          <SegmentedControl
            ariaLabel={t("set.onRefresh")}
            value={mode}
            options={grammar.refreshModes.map((entry) => ({ value: entry, label: t(`set.refreshModes.${entry}`) }))}
            onChange={(next) => update({ mode: next })}
          />
        </div>
        {mode === "delete" ? (
          <span className={hint()}>{t("set.deleteHint")}</span>
        ) : (
          <div className={line()}>
            <span className={stepText()}>{t(mode === "replace" ? "set.keepVersions" : "set.keepCopies")}</span>
            <NumberField
              label={t("set.keepLabel")}
              value={keep}
              min={1}
              max={grammar.limits.keepMax}
              onChange={(value) => update({ keep: value })}
            />
            <span className={stepText()}>{t(mode === "replace" ? "set.keepVersionsTail" : "set.keepCopiesTail")}</span>
          </div>
        )}
      </div>
    </StepRow>
  );
}
