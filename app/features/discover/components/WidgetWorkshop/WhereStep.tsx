"use client";

import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { IconButton } from "@components/ui/IconButton";
import { SelectMenu } from "@components/ui/SelectMenu";

import { defaultRuleFor, ruleText } from "./helpers";
import { RuleEditor } from "./RuleEditor";
import { StepRow } from "./StepRow";
import { ruleAdd, ruleList, ruleMatch, ruleRow, ruleTextButton } from "./styles";
import type { WhereStepProps } from "./types";

export function WhereStep({ workshop, rules, fields, limits, people }: WhereStepProps) {
  const { t } = useTranslation("widgets");
  const { ruleDraft } = workshop;
  const editingIndex = ruleDraft?.target.kind === "edit" ? ruleDraft.target.index : null;
  const [firstField] = fields;
  const editor = ruleDraft ? (
    <RuleEditor
      draft={ruleDraft}
      fields={fields}
      limits={limits}
      people={people}
      onChange={workshop.changeRule}
      onCancel={workshop.closeRule}
      onCommit={workshop.commitRule}
    />
  ) : null;

  return (
    <StepRow
      label={t("steps.where")}
      removeLabel={t("steps.remove", { step: t("steps.where") })}
      onRemove={workshop.clearRules}
    >
      <div className={ruleList()}>
        {rules.list.length >= 2 ? (
          <div className={ruleMatch()}>
            <span>{t("rules.match")}</span>
            <SelectMenu
              ariaLabel={t("rules.match")}
              value={rules.mode}
              options={[
                { value: "all", label: t("rules.all") },
                { value: "any", label: t("rules.any") },
              ]}
              onChange={workshop.setRuleMode}
            />
            <span>{t("rules.matchSuffix")}</span>
          </div>
        ) : null}
        {rules.list.map((rule, index) => {
          const text = ruleText(rule, people);
          if (index === editingIndex) return <div key={`edit-${index}`}>{editor}</div>;
          return (
            <div key={`${rule.field}-${index}`} className={ruleRow()}>
              <button
                type="button"
                className={ruleTextButton()}
                aria-label={t("rules.edit", { rule: text })}
                onClick={() => workshop.openRule({ kind: "edit", index }, rule)}
              >
                {text}
              </button>
              <IconButton
                icon={X}
                size="sm"
                animated={false}
                aria-label={t("rules.remove", { rule: text })}
                onClick={() => workshop.removeRule(index)}
              />
            </div>
          );
        })}
        {ruleDraft?.target.kind === "new" ? editor : null}
        {!ruleDraft && firstField ? (
          <Button
            variant="ghost"
            size="sm"
            className={ruleAdd()}
            onClick={() => workshop.openRule({ kind: "new" }, defaultRuleFor(firstField))}
          >
            <Plus />
            {t("rules.add")}
          </Button>
        ) : null}
      </div>
    </StepRow>
  );
}
