"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { SelectMenu } from "@components/ui/SelectMenu";

import { defaultRuleFor } from "./helpers";
import { RuleControls } from "./RuleControls";
import { ruleEditor, ruleEditorActions, ruleEditorControls } from "./styles";
import type { RuleEditorProps } from "./types";

export function RuleEditor({ draft, fields, limits, people, onChange, onCancel, onCommit }: RuleEditorProps) {
  const { t } = useTranslation("widgets");
  const adding = draft.target.kind === "new";

  return (
    <div className={ruleEditor()} role="group" aria-label={adding ? t("rules.addRule") : t("rules.saveRule")}>
      <div className={ruleEditorControls()}>
        <SelectMenu
          ariaLabel={t("rules.field")}
          value={draft.rule.field}
          options={fields.map((field) => ({ value: field, label: t(`rules.fields.${field}`) }))}
          onChange={(field) => onChange(defaultRuleFor(field))}
        />
        <RuleControls rule={draft.rule} limits={limits} people={people} onChange={onChange} />
      </div>
      <div className={ruleEditorActions()}>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          {t("rules.cancel")}
        </Button>
        <Button size="sm" onClick={onCommit}>
          {adding ? t("rules.addRule") : t("rules.saveRule")}
        </Button>
      </div>
    </div>
  );
}
