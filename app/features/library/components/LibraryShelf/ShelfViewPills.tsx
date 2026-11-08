"use client";

import { useLibraryCounts } from "@hooks/api";
import { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { LIBRARY_VIEWS, VIEW_CONFIG } from "../../constants";
import { viewCountFor } from "../../helpers";
import { revealSelectedTab } from "./helpers";
import { shelfPillsScroll, shelfTab, shelfTabCount, shelfTabs } from "./styles";
import type { ShelfViewPillsProps } from "./types";

export function ShelfViewPills({ view, onViewChange }: ShelfViewPillsProps) {
  const { t } = useTranslation("library");
  const { data: counts } = useLibraryCounts();
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    revealSelectedTab(scrollerRef.current);
  }, [view, counts]);

  return (
    <div ref={scrollerRef} className={shelfPillsScroll()}>
      <div className={shelfTabs()} role="tablist" aria-label={t("page.tabs.label")}>
        {LIBRARY_VIEWS.map((value) => {
          const count = viewCountFor(value, counts);
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={view === value}
              className={shelfTab({ active: view === value })}
              onClick={() => onViewChange(value)}
            >
              {t(VIEW_CONFIG[value].labelKey)}
              {count === undefined ? null : <span className={shelfTabCount()}>{count.toLocaleString()}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
