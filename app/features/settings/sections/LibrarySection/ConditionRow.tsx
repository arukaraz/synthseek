"use client";

import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { IconButton } from "@components/ui/IconButton";
import { Input } from "@components/ui/Input";
import { SelectMenu } from "@components/ui/SelectMenu";

import {
  FIELD_KIND,
  FIELD_OPS,
  RULE_FIELDS,
  RULE_QUALITIES,
  RULE_REQUEST_TYPES,
  RULE_VALUE_MAX_LENGTH,
} from "./constants";
import { conditionPlaceholder, draftForField } from "./helpers";
import { conditionCell, conditionRow } from "./styles";
import type { ConditionRowProps, RuleOp } from "./types";

export function ConditionRow({ draft, position, members, removable, onChange, onRemove }: ConditionRowProps) {
  const { t } = useTranslation("settings");
  const kind = FIELD_KIND[draft.field];
  const ops: readonly RuleOp[] = FIELD_OPS[draft.field];
  const valueLabel = t("libraryRules.modal.valueLabel", { position });
  const setValue = (value: string) => onChange({ ...draft, value });

  return (
    <li className={conditionRow()}>
      <div className={conditionCell()}>
        <SelectMenu
          value={draft.field}
          options={RULE_FIELDS.map((field) => ({ value: field, label: t(`libraryRules.fields.${field}`) }))}
          onChange={(field) => onChange(draftForField(field, draft.key, members[0]?.id ?? null))}
          ariaLabel={t("libraryRules.modal.fieldLabel", { position })}
        />
      </div>
      <div className={conditionCell()}>
        <SelectMenu
          value={draft.op}
          options={ops.map((op) => ({ value: op, label: t(`libraryRules.ops.${op}`) }))}
          onChange={(op) => onChange({ ...draft, op })}
          ariaLabel={t("libraryRules.modal.opLabel", { position })}
        />
      </div>
      <div className="min-w-0">
        {kind === "member" ? (
          <SelectMenu
            value={draft.value}
            options={members.map((member) => ({ value: member.id, label: member.username }))}
            onChange={setValue}
            ariaLabel={valueLabel}
            placeholder={t("libraryRules.modal.pickMember")}
          />
        ) : null}
        {kind === "quality" ? (
          <SelectMenu
            value={draft.value}
            options={RULE_QUALITIES.map((quality) => ({ value: quality, label: t(`libraryRules.quality.${quality}`) }))}
            onChange={setValue}
            ariaLabel={valueLabel}
          />
        ) : null}
        {kind === "requestType" ? (
          <SelectMenu
            value={draft.value}
            options={RULE_REQUEST_TYPES.map((type) => ({ value: type, label: t(`libraryRules.requestType.${type}`) }))}
            onChange={setValue}
            ariaLabel={valueLabel}
          />
        ) : null}
        {kind === "text" || kind === "number" ? (
          <Input
            value={draft.value}
            onChange={(event) => setValue(event.target.value)}
            inputMode={kind === "number" ? "numeric" : undefined}
            maxLength={RULE_VALUE_MAX_LENGTH}
            placeholder={conditionPlaceholder(draft.field)}
            aria-label={valueLabel}
          />
        ) : null}
      </div>
      <IconButton
        icon={X}
        size="sm"
        animated={false}
        aria-label={t("libraryRules.modal.removeCondition", { position })}
        onClick={onRemove}
        disabled={!removable}
      />
    </li>
  );
}
