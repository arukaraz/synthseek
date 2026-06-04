"use client";

import { useTranslation } from "react-i18next";

import { masterEmpty, masterScroll, table } from "../styles";

import { MasterTableHeader } from "./MasterTableHeader";
import { MasterTableRow } from "./MasterTableRow";
import type { MasterTableProps } from "./types";

export function MasterTable({ items, isLoading, draft, hiddenOnMobile }: MasterTableProps) {
  const { t } = useTranslation("library");

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) draft.setFocus(null);
  };

  return (
    <div className={masterScroll({ hiddenOnMobile })} onClick={handleBackgroundClick}>
      {isLoading ? (
        <div className={masterEmpty()}>{t("spotifyLibrary.table.loading")}</div>
      ) : items.length === 0 ? (
        <div className={masterEmpty()}>{t("spotifyLibrary.table.empty")}</div>
      ) : (
        <table className={table()}>
          <MasterTableHeader />
          <tbody>
            {items.map((item) => (
              <MasterTableRow
                key={`${item.type}:${item.id}`}
                item={item}
                selected={draft.selectors.isSelected(item.id)}
                focused={draft.state.focusedId === item.id}
                imported={draft.selectors.targetImported(item)}
                syncEnabled={draft.selectors.targetSyncEnabled(item)}
                onClick={() => draft.setFocus(item.id)}
                onToggleSelect={() => draft.toggleSelect(item.id)}
                onToggleSync={() => draft.toggleSync(item)}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
