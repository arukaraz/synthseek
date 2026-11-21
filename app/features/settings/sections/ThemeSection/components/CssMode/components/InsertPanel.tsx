"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { Input } from "@components/ui/Input";
import { THEME_CONTRACT } from "@theme/contract";
import { cn } from "@utils/cn";

import { INSERT_CATEGORIES } from "../constants";
import { insertionOf, insertItems } from "../helpers";
import {
  chip,
  chipRow,
  insertDescription,
  insertHint,
  insertItem,
  insertKey,
  insertList,
  insertMeta,
  insertNothing,
  insertPanel,
  insertSwatch,
  sidePanel,
} from "../styles";
import type { InsertCategory, InsertPanelProps } from "../types";

export function InsertPanel({ values, copy, onInsert }: InsertPanelProps) {
  const { t } = useTranslation("themeEditor");
  const [category, setCategory] = useState<InsertCategory>("all");
  const [query, setQuery] = useState("");
  const items = useMemo(
    () => insertItems({ tokens: THEME_CONTRACT.tokens, values, copy, category, query }),
    [values, copy, category, query]
  );

  return (
    <section className={cn(sidePanel(), insertPanel())}>
      <Input
        type="search"
        size="sm"
        value={query}
        placeholder={t("insert.search")}
        aria-label={t("insert.search")}
        onChange={(event) => setQuery(event.target.value)}
      />
      <FadeScroll axis="x">
        <div role="group" aria-label={t("insert.kind")} className={chipRow()}>
          {INSERT_CATEGORIES.map((own) => (
            <button
              key={own}
              type="button"
              aria-pressed={category === own}
              className={chip({ pressed: category === own })}
              onClick={() => setCategory(own)}
            >
              {t(`insert.${own}`)}
            </button>
          ))}
        </div>
      </FadeScroll>
      <div className={insertList()}>
        {items.length === 0 ? <p className={insertNothing()}>{t("insert.nothing")}</p> : null}
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            title={item.text}
            className={insertItem()}
            onClick={() => onInsert(insertionOf(item.text))}
          >
            <span
              aria-hidden
              className={insertSwatch({ empty: item.swatch === null })}
              style={item.swatch === null ? undefined : { background: item.swatch }}
            />
            <span className={insertMeta()}>
              <span className={insertKey()}>{item.key}</span>
              <span className={insertDescription()}>{item.description}</span>
            </span>
          </button>
        ))}
      </div>
      <p className={insertHint()}>{t("insert.hint")}</p>
    </section>
  );
}
