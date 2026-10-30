"use client";

import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { SegmentedControl } from "@components/ui/SegmentedControl";
import { SelectMenu } from "@components/ui/SelectMenu";

import { DEFAULT_GROUP_BY, TIME_MODES } from "./constants";
import {
  canGroupBy,
  defaultRuleFor,
  grammarSubjectOf,
  recipeShapeOf,
  rotationChoicesOf,
  rotationOf,
  ruleFieldsOf,
  ruleListOf,
  withMeasure,
  withRotation,
} from "./helpers";
import { NumberField } from "./NumberField";
import { StepRow } from "./StepRow";
import { SubjectSelect } from "./SubjectSelect";
import { addRow, stepList, stepText } from "./styles";
import type { RecipeStepsProps } from "./types";
import { WhenControls } from "./WhenControls";
import { WhereStep } from "./WhereStep";

export function RecipeSteps({ workshop, recipe, grammar, people }: RecipeStepsProps) {
  const { t } = useTranslation("widgets");
  const update = workshop.updateRecipe;
  const subject = grammarSubjectOf(grammar, recipe.subject);
  const fields = ruleFieldsOf(grammar, recipe.subject);
  const rules = ruleListOf(recipe.rules);
  const shape = recipeShapeOf(recipe, grammar);
  const limited = grammar.shapes.find((entry) => entry.key === shape)?.limitApplies ?? true;
  const groupable = canGroupBy(grammar, recipe);
  const showWhere = rules.list.length > 0 || workshop.ruleDraft !== null;
  const [firstField] = fields;
  const limits = { daysMax: grammar.limits.daysMax, topNMax: grammar.limits.topNMax };

  return (
    <div className={stepList()}>
      <StepRow label={t("steps.show")}>
        {limited ? (
          <NumberField
            label={t("steps.limitNamed")}
            value={recipe.pick.limit}
            min={grammar.pick.limitMin}
            max={grammar.pick.limitMax}
            onChange={(limit) => update((current) => ({ ...current, pick: { ...current.pick, limit } }))}
          />
        ) : null}
        <SubjectSelect workshop={workshop} value={recipe.subject} grammar={grammar} />
      </StepRow>
      <StepRow label={t("steps.measure")}>
        {recipe.groupBy ? null : (
          <SelectMenu
            ariaLabel={t("steps.measure")}
            value={recipe.pick.order}
            options={grammar.pick.orders.map((order) => ({ value: order, label: t(`orders.${order}`) }))}
            onChange={(order) => update((current) => ({ ...current, pick: { ...current.pick, order } }))}
          />
        )}
        <SelectMenu
          ariaLabel={t("steps.measure")}
          value={recipe.measure}
          options={(subject?.measures ?? []).map((measure) => ({ value: measure, label: t(`measures.${measure}`) }))}
          onChange={(measure) => update((current) => withMeasure(current, measure, grammar))}
        />
      </StepRow>
      <StepRow label={t("steps.when")}>
        <WhenControls
          time={recipe.time}
          modes={TIME_MODES}
          periods={grammar.namedPeriods}
          limits={grammar.limits}
          onChange={(time) => update((current) => ({ ...current, time }))}
        />
      </StepRow>
      {recipe.groupBy ? (
        <StepRow
          label={t("steps.groupBy")}
          removeLabel={t("steps.remove", { step: t("steps.groupBy") })}
          onRemove={() => update((current) => ({ ...current, groupBy: undefined }))}
        >
          <SelectMenu
            ariaLabel={t("steps.groupBy")}
            value={recipe.groupBy}
            options={(subject?.groupBy ?? []).map((unit) => ({ value: unit, label: t(`units.${unit}`) }))}
            onChange={(groupBy) => update((current) => ({ ...current, groupBy }))}
          />
        </StepRow>
      ) : null}
      {recipe.compare === "previous" ? (
        <StepRow
          label={t("steps.compare")}
          removeLabel={t("steps.remove", { step: t("steps.compare") })}
          onRemove={
            recipe.measure === "rankDelta" ? undefined : () => update((current) => ({ ...current, compare: undefined }))
          }
        >
          <span className={stepText()}>{t("steps.compareText")}</span>
        </StepRow>
      ) : null}
      {limited ? (
        <StepRow label={t("steps.pickBy")}>
          <SegmentedControl
            ariaLabel={t("steps.random")}
            value={rotationOf(recipe)}
            options={rotationChoicesOf(grammar).map((rotation) => ({
              value: rotation,
              label: t(`rotations.${rotation}`),
            }))}
            onChange={(rotation) => update((current) => withRotation(current, rotation))}
          />
          {recipe.subject === "albums" || recipe.subject === "requests" ? (
            <SelectMenu
              ariaLabel={t("steps.pickBy")}
              value={recipe.pick.by === "name" ? "name" : "measure"}
              options={[
                { value: "measure", label: t("pickBy.measure") },
                { value: "name", label: t("pickBy.name") },
              ]}
              onChange={(by) =>
                update((current) => ({
                  ...current,
                  pick: { ...current.pick, by: by === "name" ? "name" : current.measure },
                }))
              }
            />
          ) : null}
        </StepRow>
      ) : null}
      {showWhere ? (
        <WhereStep workshop={workshop} rules={rules} fields={fields} limits={limits} people={people} />
      ) : null}
      <div className={addRow()}>
        {groupable && !recipe.groupBy ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => update((current) => ({ ...current, groupBy: DEFAULT_GROUP_BY }))}
          >
            <Plus />
            {t("steps.add.groupBy")}
          </Button>
        ) : null}
        {recipe.compare === "previous" ? null : (
          <Button variant="ghost" size="sm" onClick={() => update((current) => ({ ...current, compare: "previous" }))}>
            <Plus />
            {t("steps.add.compare")}
          </Button>
        )}
        {!showWhere && firstField ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => workshop.openRule({ kind: "new" }, defaultRuleFor(firstField))}
          >
            <Plus />
            {t("steps.add.where")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
