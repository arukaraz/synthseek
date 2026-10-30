"use client";

import { useTranslation } from "react-i18next";

import { RECAP_SUBJECT, RECAP_TIME_MODES } from "./constants";
import { recapPeriodFrom } from "./helpers";
import { StepRow } from "./StepRow";
import { stepList, stepText } from "./styles";
import { SubjectSelect } from "./SubjectSelect";
import type { RecapStepsProps } from "./types";
import { WhenControls } from "./WhenControls";

export function RecapSteps({ workshop, recap, context }: RecapStepsProps) {
  const { t } = useTranslation("widgets");
  const { recap: grammar } = context.catalog;

  return (
    <div className={stepList()}>
      <StepRow label={t("steps.show")}>
        <SubjectSelect workshop={workshop} value={RECAP_SUBJECT} grammar={context.grammar} />
      </StepRow>
      <StepRow label={t("steps.when")}>
        <WhenControls
          time={recap.period}
          modes={RECAP_TIME_MODES}
          periods={grammar.namedPeriods}
          limits={{ daysMax: context.grammar.limits.daysMax, yearMin: grammar.yearMin, yearMax: grammar.yearMax }}
          onChange={(time) => workshop.setRecapPeriod(recapPeriodFrom(time, grammar.namedPeriods))}
        />
      </StepRow>
      <StepRow label={t("steps.pages")}>
        <span className={stepText()}>{t("steps.recapPages", { minimum: grammar.minimumPlays })}</span>
      </StepRow>
    </div>
  );
}
