"use client";

import { Button } from "@components/ui/Button";
import { Dialog, DialogContent, DialogTitle } from "@components/ui/Dialog";
import { useTranslation } from "react-i18next";

import { LibraryFilterSidebar } from "../LibraryFilterSidebar/LibraryFilterSidebar";
import { sheetBody, sheetContent, sheetFooter, sheetHeader, sheetTitle } from "./styles";
import type { LibraryFilterSheetProps } from "./types";

export function LibraryFilterSheet({ open, onOpenChange, ...sidebarProps }: LibraryFilterSheetProps) {
  const { t } = useTranslation("library");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={sheetContent()} animation="sheet" showClose={false}>
        <div className={sheetHeader()}>
          <DialogTitle className={sheetTitle()}>{t("page.filters.title")}</DialogTitle>
        </div>
        <div className={sheetBody()}>
          <LibraryFilterSidebar {...sidebarProps} />
        </div>
        <div className={sheetFooter()}>
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            {t("page.filters.done")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
