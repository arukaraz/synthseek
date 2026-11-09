"use client";

import { AdminOnlyMark } from "@components/ui/AdminOnlyMark";
import { BottomSheet, BottomSheetHeader, bottomSheetBody } from "@components/ui/BottomSheet";
import { ArrowDown, ArrowUp, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  sheetGroupHeading,
  sheetMenuCheck,
  sheetMenuItem,
  sheetOrderButton,
  sheetOrderRow,
  sheetOrderSegment,
  sheetSeparator,
} from "./styles";
import type { ShelfSortSheetProps } from "./types";

export function ShelfSortSheet({ controller, open, onOpenChange }: ShelfSortSheetProps) {
  const { t } = useTranslation(["library", "components"]);
  const { config, sort, effectiveDirection } = controller;

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} size="half" showClose={false}>
      <BottomSheetHeader title={t("page.toolbar.sort")} subtitle={t(config.labelKey)} />
      <div className={bottomSheetBody()}>
        <p className={sheetGroupHeading()}>{t("components:filterSort.sortLabel")}</p>
        {controller.sortOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={sheetMenuItem({ selected: sort === option.value })}
            onClick={() => controller.setSort(option.value)}
            aria-pressed={sort === option.value}
          >
            <span className="min-w-0 flex-1">{t(option.labelKey)}</span>
            {option.adminOnly ? <AdminOnlyMark /> : null}
            {sort === option.value ? <Check className={sheetMenuCheck()} /> : null}
          </button>
        ))}
        <div className={sheetSeparator()} />
        <p className={sheetGroupHeading()}>{t("components:filterSort.orderLabel")}</p>
        <div className={sheetOrderRow()}>
          <div className={sheetOrderSegment()}>
            <button
              type="button"
              className={sheetOrderButton({ active: effectiveDirection === "asc" })}
              onClick={() => controller.setDir("asc")}
              aria-pressed={effectiveDirection === "asc"}
            >
              <ArrowUp className="size-4" />
              {t("components:filterSort.ascending")}
            </button>
            <button
              type="button"
              className={sheetOrderButton({ active: effectiveDirection === "desc" })}
              onClick={() => controller.setDir("desc")}
              aria-pressed={effectiveDirection === "desc"}
            >
              <ArrowDown className="size-4" />
              {t("components:filterSort.descending")}
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
