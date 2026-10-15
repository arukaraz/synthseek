"use client";

import { useTranslation } from "react-i18next";

import { Checkbox } from "@components/ui/Checkbox";

import { SettingsField } from "../../components/SettingsField";
import { ruleSummary } from "./helpers";
import { choiceList, choiceName, choiceOwner, choiceRow, choiceSummary, choiceText, fieldMessage } from "./styles";
import type { PathRulesPickerProps } from "./types";

export function PathRulesPicker({ pathId, rules, paths, members, selected, onToggle, refusal }: PathRulesPickerProps) {
  const { t } = useTranslation("settings");
  const takenRule =
    refusal?.outcome === "rule_taken" ? (rules.find((rule) => rule.id === refusal.ruleId) ?? null) : null;

  return (
    <SettingsField label={t("libraryPaths.rules.label")}>
      {rules.length === 0 ? (
        <span className={fieldMessage()}>{t("libraryPaths.rules.empty")}</span>
      ) : (
        <ul className={choiceList()}>
          {rules.map((rule) => {
            const owner =
              rule.libraryPathId !== null && rule.libraryPathId !== pathId
                ? (paths.find((path) => path.id === rule.libraryPathId)?.label ?? t("libraryPaths.rules.otherPath"))
                : null;
            return (
              <li key={rule.id}>
                <label className={choiceRow({ taken: owner !== null })}>
                  <Checkbox
                    checked={selected.includes(rule.id)}
                    disabled={owner !== null}
                    onCheckedChange={(checked) => onToggle(rule.id, checked === true)}
                    aria-label={rule.name}
                  />
                  <span className={choiceText()}>
                    <span className={choiceName()}>{rule.name}</span>
                    <span className={choiceSummary()}>{ruleSummary(rule, members)}</span>
                  </span>
                  {owner === null ? null : (
                    <span className={choiceOwner()}>{t("libraryPaths.rules.usedBy", { label: owner })}</span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>
      )}
      {refusal?.outcome === "rule_taken" ? (
        <span className={fieldMessage({ tone: "danger" })}>
          {takenRule === null
            ? t("libraryPaths.rules.takenUnknown")
            : t("libraryPaths.rules.taken", { name: takenRule.name })}
        </span>
      ) : null}
    </SettingsField>
  );
}
