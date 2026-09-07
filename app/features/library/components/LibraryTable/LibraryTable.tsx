"use client";

import { BulkActionBar, selectionAction, selectionActionLabel, type BulkAction } from "@components/ui/BulkActionBar";
import { Checkbox } from "@components/ui/Checkbox";
import { DataTable, type ColumnDef } from "@components/ui/Table";
import { CirclePlus, ListPlus, RefreshCcw, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AddToPlaylistDropdown } from "../AddToPlaylistDropdown";
import { useLibraryTrackActions } from "../../hooks/useLibraryTrackActions";
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
  const upgradableIds = sel?.selectors.selectedUpgradableIds(trackItems) ?? [];
  const playableIds = sel?.selectors.selectedPlayableIds(trackItems) ?? [];

  const selectColumn: ColumnDef<TItem> | null = sel
    ? {
        key: "select",
        className: "w-[6%]",
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

  const bulkActions: BulkAction[] = [];
  if (failedIds.length > 0) {
    bulkActions.push({
      icon: RefreshCcw,
      label: t("page.selection.retryFailed", { count: failedIds.length }),
      onClick: () => actions.retryFailed(failedIds),
      count: failedIds.length,
      disabled: actions.isRetrying,
    });
  }
  if (upgradableIds.length > 0) {
    bulkActions.push({
      icon: Sparkles,
      label: t("page.selection.searchBetterQuality", { count: upgradableIds.length }),
      onClick: () => actions.searchBetterQuality(upgradableIds),
      count: upgradableIds.length,
      disabled: actions.isUpgrading,
    });
  }
  if (sel && playableIds.length > 0) {
    bulkActions.push({
      icon: CirclePlus,
      label: t("page.selection.addToQueue", { count: playableIds.length }),
      onClick: () => {
        void selection?.onEnqueue(playableIds).then((added) => {
          if (added) sel.clear();
        });
      },
      count: playableIds.length,
    });
  }

  const addToPlaylistLabel = t("page.selection.addToPlaylist");

  return (
    <div className={tableWrap()}>
      {sel && sel.selectedCount > 0 ? (
        <BulkActionBar
          count={sel.selectedCount}
          countLabel={t("page.selection.selected")}
          actions={bulkActions}
          clearLabel={t("page.selection.clear")}
          onClear={sel.clear}
          trailing={
            <AddToPlaylistDropdown
              trackIds={[...sel.selectedIds]}
              onDone={sel.clear}
              trigger={
                <button type="button" className={selectionAction()} aria-label={addToPlaylistLabel}>
                  <ListPlus className="size-3.5 shrink-0" aria-hidden />
                  <span className={selectionActionLabel()} aria-hidden>
                    {addToPlaylistLabel}
                  </span>
                </button>
              }
            />
          }
        />
      ) : null}

      <DataTable data={items} columns={tableColumns} getRowId={getRowId} emptyMessage={emptyMessage} fixedLayout />
    </div>
  );
}
