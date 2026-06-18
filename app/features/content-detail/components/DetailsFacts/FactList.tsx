"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { bioToggle, factBullet, factBulletItem, factBulletList, factLabel, factListRow } from "../../styles";
import { FACT_LIST_COLLAPSED_LIMIT } from "./constants";
import type { FactListProps } from "./types";

export function FactList({ label, items }: FactListProps) {
  const { t } = useTranslation("contentDetail");
  const [expanded, setExpanded] = useState(false);

  const isExpandable = items.length > FACT_LIST_COLLAPSED_LIMIT;
  const visibleItems = isExpandable && !expanded ? items.slice(0, FACT_LIST_COLLAPSED_LIMIT) : items;
  const hiddenCount = items.length - FACT_LIST_COLLAPSED_LIMIT;

  return (
    <div className={factListRow()}>
      <dt className={factLabel()}>{label}</dt>
      <dd>
        <ul className={factBulletList()}>
          {visibleItems.map((item) => (
            <li key={item} className={factBulletItem()}>
              <span className={factBullet()} aria-hidden>
                &bull;
              </span>
              {item}
            </li>
          ))}
        </ul>
        {isExpandable ? (
          <button type="button" className={bioToggle()} onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? t("details.showLess") : t("details.showMore", { count: hiddenCount })}
          </button>
        ) : null}
      </dd>
    </div>
  );
}
