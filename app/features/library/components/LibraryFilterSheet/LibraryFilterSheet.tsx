"use client";

import { BottomSheet, BottomSheetHeader, bottomSheetBody, bottomSheetFooter } from "@components/ui/BottomSheet";
import { Button } from "@components/ui/Button";
import { useTranslation } from "react-i18next";

import { countActiveFilters } from "../../helpers";
import { LibraryFilterSidebar } from "../LibraryFilterSidebar/LibraryFilterSidebar";
import { sheetBody } from "./styles";
import type { LibraryFilterSheetProps } from "./types";

export function LibraryFilterSheet({ open, onOpenChange, total, ...sidebarProps }: LibraryFilterSheetProps) {
  const { t } = useTranslation("library");
  const activeCount = countActiveFilters(sidebarProps.filters);
  const viewLabel = t(sidebarProps.config.labelKey);

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} size="full" showClose={false}>
      <BottomSheetHeader
        title={t("page.filters.title")}
        subtitle={activeCount > 0 ? t("page.shelf.activeFilters", { view: viewLabel, count: activeCount }) : viewLabel}
      />
      <div className={bottomSheetBody({ className: sheetBody() })}>
        <LibraryFilterSidebar {...sidebarProps} showHeader={false} />
      </div>
      <div className={bottomSheetFooter()}>
        <Button variant="ghost" onClick={sidebarProps.onClear} disabled={!sidebarProps.hasActiveFilters}>
          {t("page.filters.clear")}
        </Button>
        <Button className="flex-1" onClick={() => onOpenChange(false)}>
          {t("page.shelf.showResults", {
            results: t(`page.counts.${sidebarProps.config.view}`, { count: total }),
          })}
        </Button>
      </div>
    </BottomSheet>
  );
}
