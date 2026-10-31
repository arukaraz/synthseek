"use client";

import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { IconButton } from "@components/ui/IconButton";
import { SelectMenu } from "@components/ui/SelectMenu";

import { defaultRuleFor, ruleText } from "../helpers";
import { RuleEditor } from "../RuleEditor";
import { StepRow } from "../StepRow";
import { ruleMatch, ruleTextButton } from "../styles";
import type { WhereStepProps } from "../types";
import { ruleItem, ruleItems, stack, whereHead, whereTools } from "./styles";

export function SetWhereStep({ workshop, rules, fields, limits, people, playlists }: WhereStepProps) {
  const { t } = useTranslation("widgets");
  const { ruleDraft } = workshop;
  const editingIndex = ruleDraft?.target.kind === "edit" ? ruleDraft.target.index : null;
  const [firstField] = fields;
  const clearable = rules.list.length > 0 || ruleDraft !== null;
  const clearLabel = t("steps.remove", { step: t("steps.where") });
  const editor = ruleDraft ? (
    <RuleEditor
      draft={ruleDraft}
      fields={fields}
      limits={limits}
      people={people}
      playlists={playlists}
      onChange={workshop.changeRule}
      onCancel={workshop.closeRule}
      onCommit={workshop.commitRule}
    />
  ) : null;

  return (
    <StepRow label={t("steps.where")} flush>
      <div className={stack()}>
        <div className={whereHead()}>
          <div className={ruleMatch({ shown: rules.list.length >= 2 })}>
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
            <span>{t("rules.matchSuffixShared")}</span>
          </div>
          <span className={whereTools()}>
            {!ruleDraft && firstField ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => workshop.openRule({ kind: "new" }, defaultRuleFor(firstField))}
              >
                <Plus />
                {t("rules.add")}
              </Button>
            ) : null}
            {clearable ? (
              <IconButton
                icon={X}
                size="sm"
                animated={false}
                aria-label={clearLabel}
                title={clearLabel}
                onClick={workshop.clearRules}
              />
            ) : null}
          </span>
        </div>
        {rules.list.length > 0 ? (
          <ul className={ruleItems()}>
            {rules.list.map((rule, index) => {
              const text = ruleText(rule, people, playlists);
              if (index === editingIndex) return <li key={`edit-${index}`}>{editor}</li>;
              return (
                <li key={`${rule.field}-${index}`} className={ruleItem()}>
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
                </li>
              );
            })}
          </ul>
        ) : null}
        {ruleDraft?.target.kind === "new" ? editor : null}
      </div>
    </StepRow>
  );
}
