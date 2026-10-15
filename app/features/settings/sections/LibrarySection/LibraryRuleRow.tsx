"use client";

import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { IconButton } from "@components/ui/IconButton";

import { pill } from "../../styles";
import { ruleSummary } from "./helpers";
import { listRow, listRowGrid, rowActions, rowIdentity, rowOrder, rowStat, rowStatSub, rowTitle } from "./styles";
import type { LibraryRuleRowProps } from "./types";

export function LibraryRuleRow({
  rule,
  index,
  count,
  pathLabel,
  members,
  reordering,
  onMove,
  onEdit,
  onDelete,
}: LibraryRuleRowProps) {
  const { t } = useTranslation("settings");
  const summary = ruleSummary(rule, members);

  return (
    <li className={listRow()} aria-label={rule.name}>
      <div className={listRowGrid({ layout: "rules" })}>
        <div className={rowOrder()}>
          <IconButton
            icon={ChevronUp}
            size="sm"
            animated={false}
            aria-label={t("libraryRules.moveUp", { name: rule.name })}
            onClick={() => onMove(-1)}
            disabled={index === 0 || reordering}
          />
          <IconButton
            icon={ChevronDown}
            size="sm"
            animated={false}
            aria-label={t("libraryRules.moveDown", { name: rule.name })}
            onClick={() => onMove(1)}
            disabled={index === count - 1 || reordering}
          />
        </div>

        <div className={rowIdentity()}>
          <span className={rowTitle()}>{rule.name}</span>
          <span className={rowStatSub()}>{t("libraryRules.priority", { position: index + 1 })}</span>
        </div>

        <div className={rowStat()}>
          <span className={rowStatSub()} title={summary}>
            {summary}
          </span>
        </div>

        <div className={rowStat()}>
          {pathLabel === null ? (
            <span className={rowStatSub()}>{t("libraryRules.notUsed")}</span>
          ) : (
            <div>
              <span className={pill({ tone: "muted" })}>{pathLabel}</span>
            </div>
          )}
        </div>

        <div className={rowActions({ layout: "rules" })}>
          <Button
            variant="secondary"
            size="sm"
            onClick={onEdit}
            aria-label={t("libraryRules.editLabel", { name: rule.name })}
          >
            <Pencil className="size-4" aria-hidden />
            {t("libraryRules.edit")}
          </Button>
          <IconButton
            icon={Trash2}
            size="sm"
            variant="red"
            aria-label={t("libraryRules.delete", { name: rule.name })}
            onClick={onDelete}
          />
        </div>
      </div>
    </li>
  );
}
