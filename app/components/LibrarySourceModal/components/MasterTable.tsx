"use client";

import { useTranslation } from "react-i18next";

import { useOverflowsX } from "@hooks/ui/useOverflowsX";
import { scrollRegionProps } from "@utils/scroll-region";

import { masterControls, masterEmpty, masterFooter, masterScroll, masterXScroll, table } from "../styles";

import { MasterTableHeader } from "./MasterTableHeader";
import { MasterTableRow } from "./MasterTableRow";
import type { MasterTableProps } from "./types";

export function MasterTable({ items, isLoading, draft, hiddenOnMobile, selectionBar, footer }: MasterTableProps) {
  const { t } = useTranslation(["library", "components"]);
  const [scrollRef, overflowsX] = useOverflowsX<HTMLDivElement>();

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) draft.setFocus(null);
  };

  return (
    <div className={masterScroll({ hiddenOnMobile })} onClick={handleBackgroundClick}>
      {selectionBar ? <div className={masterControls()}>{selectionBar}</div> : null}
      {isLoading ? (
        <div className={masterEmpty()}>{t("librarySource.table.loading")}</div>
      ) : items.length === 0 ? (
        <div className={masterEmpty()}>{t("librarySource.table.empty")}</div>
      ) : (
        <div
          ref={scrollRef}
          className={masterXScroll()}
          onClick={handleBackgroundClick}
          {...scrollRegionProps(overflowsX, t("components:table.scrollRegion"))}
        >
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
                  syncAvailable={item.type === "playlist"}
                  onClick={() => draft.setFocus(item.id)}
                  onToggleSelect={() => draft.toggleSelect(item.id)}
                  onToggleSync={() => draft.toggleSync(item)}
                />
              ))}
            </tbody>
          </table>
          {footer ? <div className={masterFooter()}>{footer}</div> : null}
        </div>
      )}
    </div>
  );
}
