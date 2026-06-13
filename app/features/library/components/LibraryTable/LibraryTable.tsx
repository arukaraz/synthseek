"use client";

import { Checkbox } from "@components/ui/Checkbox";
import { DataTable, type ColumnDef } from "@components/ui/Table";
import { useTranslation } from "react-i18next";

import { useLibraryTrackActions } from "../../hooks/useLibraryTrackActions";
import { SelectionBulkBar } from "./SelectionBulkBar";
import { selectCell, tableWrap } from "./styles";
import type { LibraryTableProps } from "./types";

export function LibraryTable<TItem>({ items, columns, getRowId, emptyMessage, selection }: LibraryTableProps<TItem>) {
  const { t } = useTranslation("library");
  const actions = useLibraryTrackActions();

  const trackItems = selection?.items ?? [];
  const sel = selection?.selection;
  const allSelected = sel?.selectors.allSelectedOnPage(trackItems) ?? false;
  const someSelected = sel?.selectors.someSelectedOnPage(trackItems) ?? false;
  const failedIds = sel?.selectors.selectedFailedIds(trackItems) ?? [];

  const selectColumn: ColumnDef<TItem> | null = sel
    ? {
        key: "select",
        className: "w-10",
        header: () => (
          <Checkbox
            checked={allSelected ? true : someSelected ? "indeterminate" : false}
            onCheckedChange={(value) =>
              sel.setMany(
                trackItems.map((item) => item.id),
                value === true
              )
            }
            aria-label={t("page.selection.selectAll")}
          />
        ),
        cell: (item) => (
          <div className={selectCell()}>
            <Checkbox
              checked={sel.isSelected(getRowId(item))}
              onCheckedChange={() => sel.toggle(getRowId(item))}
              aria-label={t("page.selection.selectRow")}
            />
          </div>
        ),
      }
    : null;

  const tableColumns = selectColumn ? [selectColumn, ...columns] : columns;

  return (
    <div className={tableWrap()}>
      {sel && sel.selectedCount > 0 ? (
        <SelectionBulkBar
          selectedCount={sel.selectedCount}
          failedCount={failedIds.length}
          onRetryFailed={() => actions.retryFailed(failedIds)}
          onAddToPlaylist={() => {}}
          onClear={sel.clear}
          isRetrying={actions.isRetrying}
        />
      ) : null}

      <DataTable data={items} columns={tableColumns} getRowId={getRowId} emptyMessage={emptyMessage} />
    </div>
  );
}
