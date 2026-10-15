"use client";

import { Loader2, Plus } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/Dialog";
import { Input } from "@components/ui/Input";
import { Notice } from "@components/ui/Notice";
import { useCreateLibraryRule, useUpdateLibraryRule } from "@hooks/api/mutations/library/useLibraryRules";

import { SegmentedControl } from "../../components/SegmentedControl";
import { SettingsField } from "../../components/SettingsField";
import { ConditionRow } from "./ConditionRow";
import { MAX_RULE_CONDITIONS, RULE_NAME_MAX_LENGTH } from "./constants";
import { conditionFromDraft, draftForField, draftFromCondition } from "./helpers";
import { conditionList, fieldMessage, formStack, modalFooter } from "./styles";
import type { ConditionDraft, LibraryRuleModalProps, RuleMatchMode, RuleWriteRefusal, RuleWriteResult } from "./types";

export function LibraryRuleModal({ rule, members, onClose }: LibraryRuleModalProps) {
  const { t } = useTranslation("settings");
  const nameId = useId();
  const create = useCreateLibraryRule();
  const update = useUpdateLibraryRule();
  const [name, setName] = useState(rule?.name ?? "");
  const [matchMode, setMatchMode] = useState<RuleMatchMode>(rule?.matchMode ?? "all");
  const [drafts, setDrafts] = useState<readonly ConditionDraft[]>(() =>
    rule === null
      ? [draftForField("genre", crypto.randomUUID(), null)]
      : rule.conditions.map((condition) => draftFromCondition(condition, crypto.randomUUID()))
  );
  const [refusal, setRefusal] = useState<RuleWriteRefusal | null>(null);

  const conditions = drafts.flatMap((draft) => {
    const condition = conditionFromDraft(draft);
    return condition === null ? [] : [condition];
  });
  const saving = create.isPending || update.isPending;
  const canSave = name.trim().length > 0 && drafts.length > 0 && conditions.length === drafts.length && !saving;

  const edit = (apply: () => void) => {
    setRefusal(null);
    apply();
  };

  const settle = (result: RuleWriteResult) => {
    if (result.outcome === "saved" || result.outcome === "not_found") {
      onClose();
      return;
    }
    setRefusal(result);
  };

  const submit = () => {
    if (!canSave) return;
    const input = { name: name.trim(), matchMode, conditions };
    if (rule === null) {
      create.mutate(input, { onSuccess: settle });
      return;
    }
    update.mutate({ id: rule.id, ...input }, { onSuccess: settle });
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {rule === null ? t("libraryRules.modal.addTitle") : t("libraryRules.modal.editTitle")}
          </DialogTitle>
        </DialogHeader>

        <form
          className={formStack()}
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <SettingsField
            label={t("libraryRules.modal.name")}
            htmlFor={nameId}
            helper={
              refusal?.outcome === "name_taken" ? (
                <span className={fieldMessage({ tone: "danger" })}>{t("libraryRules.modal.nameTaken")}</span>
              ) : undefined
            }
          >
            <Input
              id={nameId}
              value={name}
              maxLength={RULE_NAME_MAX_LENGTH}
              placeholder={t("libraryRules.modal.namePlaceholder")}
              aria-invalid={refusal?.outcome === "name_taken"}
              onChange={(event) => edit(() => setName(event.target.value))}
            />
          </SettingsField>

          <SettingsField label={t("libraryRules.modal.matchLabel")}>
            <div>
              <SegmentedControl
                value={matchMode}
                options={[
                  { value: "all", label: t("libraryRules.modal.matchAll") },
                  { value: "any", label: t("libraryRules.modal.matchAny") },
                ]}
                onChange={(next) => edit(() => setMatchMode(next))}
                ariaLabel={t("libraryRules.modal.matchLabel")}
              />
            </div>
          </SettingsField>

          <SettingsField
            label={t("libraryRules.modal.conditionsLabel")}
            contentSpacing="loose"
            helper={
              drafts.length >= MAX_RULE_CONDITIONS
                ? t("libraryRules.modal.conditionLimit", { count: MAX_RULE_CONDITIONS })
                : undefined
            }
          >
            <ul className={conditionList()}>
              {drafts.map((draft, index) => (
                <ConditionRow
                  key={draft.key}
                  draft={draft}
                  position={index + 1}
                  members={members}
                  removable={drafts.length > 1}
                  onChange={(next) =>
                    edit(() => setDrafts((list) => list.map((entry) => (entry.key === next.key ? next : entry))))
                  }
                  onRemove={() => edit(() => setDrafts((list) => list.filter((entry) => entry.key !== draft.key)))}
                />
              ))}
            </ul>
            <div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  edit(() =>
                    setDrafts((list) => [
                      ...list,
                      draftForField("quality", crypto.randomUUID(), members[0]?.id ?? null),
                    ])
                  )
                }
                disabled={drafts.length >= MAX_RULE_CONDITIONS}
              >
                <Plus className="size-4" aria-hidden />
                {t("libraryRules.modal.addCondition")}
              </Button>
            </div>
          </SettingsField>

          {refusal?.outcome === "too_many" ? <Notice variant="danger" title={t("libraryRules.modal.tooMany")} /> : null}

          <Notice variant="info" title={t("libraryRules.modal.pathNote")} />

          <DialogFooter className={modalFooter()}>
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              {t("libraryRules.modal.cancel")}
            </Button>
            <Button type="submit" disabled={!canSave}>
              {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {rule === null ? t("libraryRules.modal.add") : t("libraryRules.modal.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
