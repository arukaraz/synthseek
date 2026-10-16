"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { Notice } from "@components/ui/Notice";
import { useRemoveLibraryRule, useReorderLibraryRules } from "@hooks/api/mutations/library/useLibraryRules";
import { useLibraryPaths } from "@hooks/api/queries/useLibraryPaths";
import { useLibraryRules } from "@hooks/api/queries/useLibraryRules";
import { useUsers } from "@hooks/api/queries/useUsers";

import { SettingsCard } from "../../components/SettingsCard";
import { emptyPanel, namingHint } from "../../styles";
import { movedIds } from "./helpers";
import { LibraryRuleModal } from "./LibraryRuleModal";
import { LibraryRuleRow } from "./LibraryRuleRow";
import { listFrame, listHead, listHeadEnd } from "./styles";
import type { LibraryRule, RuleModalTarget } from "./types";

export function LibraryRulesCard() {
  const { t } = useTranslation("settings");
  const rules = useLibraryRules();
  const paths = useLibraryPaths();
  const users = useUsers();
  const reorder = useReorderLibraryRules();
  const remove = useRemoveLibraryRule();
  const [target, setTarget] = useState<RuleModalTarget | null>(null);
  const [deleting, setDeleting] = useState<LibraryRule | null>(null);

  const title = t("libraryRules.card.title");
  const description = t("libraryRules.card.description");
  const members = users.data ?? [];

  if (rules.isLoading) {
    return (
      <SettingsCard title={title} description={description}>
        <span className={namingHint()}>{t("libraryRules.loading")}</span>
      </SettingsCard>
    );
  }

  if (rules.isError || rules.data === undefined) {
    return (
      <SettingsCard title={title} description={description}>
        <Notice variant="danger" title={t("libraryRules.loadFailed")} />
      </SettingsCard>
    );
  }

  const list = [...rules.data].sort((left, right) => left.position - right.position);
  const ids = list.map((rule) => rule.id);
  const labelOf = (pathId: string | null) =>
    pathId === null ? null : (paths.data?.find((path) => path.id === pathId)?.label ?? null);
  const editing = target?.mode === "edit" ? (list.find((rule) => rule.id === target.ruleId) ?? null) : null;
  const deletingPath = deleting === null ? null : labelOf(deleting.libraryPathId);

  return (
    <SettingsCard
      title={title}
      description={description}
      anchor="library-rules"
      trailing={
        <Button onClick={() => setTarget({ mode: "add" })}>
          <Plus className="size-4" aria-hidden />
          {t("libraryRules.add")}
        </Button>
      }
    >
      {list.length === 0 ? (
        <div className={emptyPanel()}>
          <span className={namingHint()}>{t("libraryRules.empty")}</span>
        </div>
      ) : (
        <div className={listFrame()}>
          <div className={listHead({ layout: "rules" })} aria-hidden>
            <span>{t("libraryRules.columns.order")}</span>
            <span>{t("libraryRules.columns.rule")}</span>
            <span>{t("libraryRules.columns.conditions")}</span>
            <span>{t("libraryRules.columns.usedBy")}</span>
            <span className={listHeadEnd()} />
          </div>
          <ol aria-label={title}>
            {list.map((rule, index) => (
              <LibraryRuleRow
                key={rule.id}
                rule={rule}
                index={index}
                count={list.length}
                pathLabel={labelOf(rule.libraryPathId)}
                members={members}
                reordering={reorder.isPending}
                onMove={(offset) => reorder.mutate({ ids: movedIds(ids, index, offset) })}
                onEdit={() => setTarget({ mode: "edit", ruleId: rule.id })}
                onDelete={() => setDeleting(rule)}
              />
            ))}
          </ol>
        </div>
      )}

      {target === null || (target.mode === "edit" && editing === null) ? null : (
        <LibraryRuleModal
          key={target.mode === "edit" ? target.ruleId : "new"}
          rule={editing}
          members={members}
          onClose={() => setTarget(null)}
        />
      )}

      <ConfirmationModal
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting !== null) remove.mutate({ id: deleting.id });
        }}
        title={t("libraryRules.deleteConfirm.title", { name: deleting?.name ?? "" })}
        message={
          deletingPath === null
            ? t("libraryRules.deleteConfirm.unused")
            : t("libraryRules.deleteConfirm.used", { label: deletingPath })
        }
        confirmText={t("libraryRules.deleteConfirm.yes")}
        variant="danger"
      />
    </SettingsCard>
  );
}
