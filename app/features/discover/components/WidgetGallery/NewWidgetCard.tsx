"use client";

import { Braces, ChevronRight, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { WIDGET_KIND_ICONS, WIDGET_KINDS } from "../WidgetWorkshop/constants";
import {
  newCard,
  newCardBadge,
  newCardChevron,
  newCardHead,
  newCardHint,
  newCardIcon,
  newCardLabel,
  newCardRow,
  newCardRows,
  newCardSubtitle,
  newCardText,
  newCardTitle,
} from "./styles";
import type { NewWidgetCardProps } from "./types";

export function NewWidgetCard({ onCreate, onImport }: NewWidgetCardProps) {
  const { t } = useTranslation("widgets");

  return (
    <div className={newCard()} role="group" aria-label={t("mine.newWidget")}>
      <div className={newCardHead()}>
        <span className={newCardBadge()} aria-hidden>
          <Plus />
        </span>
        <span className={newCardText()}>
          <span className={newCardTitle()}>{t("mine.newWidget")}</span>
          <span className={newCardSubtitle()}>{t("mine.start.title")}</span>
        </span>
      </div>
      <div className={newCardRows()}>
        {WIDGET_KINDS.map((kind) => {
          const Icon = WIDGET_KIND_ICONS[kind];
          return (
            <button key={kind} type="button" className={newCardRow()} onClick={() => onCreate(kind)}>
              <span className={newCardIcon({ tone: kind })} aria-hidden>
                <Icon />
              </span>
              <span className={newCardText()}>
                <span className={newCardLabel()}>{t(`kinds.${kind}`)}</span>
                <span className={newCardHint()}>{t(`mine.start.${kind}`)}</span>
              </span>
              <ChevronRight className={newCardChevron()} aria-hidden />
            </button>
          );
        })}
        <button type="button" className={newCardRow()} onClick={onImport}>
          <span className={newCardIcon({ tone: "json" })} aria-hidden>
            <Braces />
          </span>
          <span className={newCardText()}>
            <span className={newCardLabel()}>{t("mine.fromJson")}</span>
            <span className={newCardHint()}>{t("mine.start.json")}</span>
          </span>
          <ChevronRight className={newCardChevron()} aria-hidden />
        </button>
      </div>
    </div>
  );
}
