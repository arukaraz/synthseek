"use client";

import { Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { IconButton } from "@components/ui/IconButton";
import { SelectMenu } from "@components/ui/SelectMenu";

import { UNSET_RULE_VALUE } from "./constants";
import { defaultRuleFor } from "./helpers";
import { RuleControls } from "./RuleControls";
import { ruleEditor, ruleEditorActions } from "./styles";
import type { RuleEditorProps } from "./types";

export function RuleEditor({
  draft,
  fields,
  limits,
  people,
  playlists,
  onChange,
  onCancel,
  onCommit,
}: RuleEditorProps) {
  const { t } = useTranslation("widgets");
  const adding = draft.target.kind === "new";
  const commitLabel = adding ? t("rules.addRule") : t("rules.saveRule");

  return (
    <div className={ruleEditor()} role="group" aria-label={commitLabel}>
      <SelectMenu
        ariaLabel={t("rules.field")}
        value={draft.rule.field}
        options={fields.map((field) => ({ value: field, label: t(`rules.fields.${field}`) }))}
        onChange={(field) => onChange(defaultRuleFor(field))}
      />
      <RuleControls rule={draft.rule} limits={limits} people={people} playlists={playlists} onChange={onChange} />
      <span className={ruleEditorActions()}>
        <IconButton icon={X} size="sm" animated={false} aria-label={t("rules.cancel")} onClick={onCancel} />
        <IconButton
          icon={Check}
          size="sm"
          animated={false}
          aria-label={commitLabel}
          disabled={draft.rule.value === UNSET_RULE_VALUE}
          onClick={onCommit}
        />
      </span>
    </div>
  );
}
