"use client";

import { BulkActionBar } from "@components/ui/BulkActionBar";
import { useTranslation } from "react-i18next";

import { BULK_ACTION_META } from "./consts";
import { availableBulkActions, bulkActionTargets } from "./helpers";
import { bulkBarFloating, bulkBarWrap } from "./styles";
import type { RequestDetailBulkBarProps } from "./types";

export function RequestDetailBulkBar({ selected, permissions, onClear, onBulk }: RequestDetailBulkBarProps) {
  const { t } = useTranslation("requests");

  if (selected.length === 0) return null;

  const targets = bulkActionTargets(selected, permissions);

  return (
    <div className={bulkBarWrap()} data-cy="request-bulk-bar">
      <BulkActionBar
        count={selected.length}
        countLabel={t("bulk.selected", { count: selected.length })}
        clearLabel={t("bulk.clear")}
        onClear={onClear}
        className={bulkBarFloating()}
        actions={availableBulkActions(targets).map((id) => ({
          icon: BULK_ACTION_META[id].icon,
          label: t(BULK_ACTION_META[id].labelKey),
          count: targets[id].length,
          onClick: () => onBulk(id, targets[id]),
        }))}
      />
    </div>
  );
}
