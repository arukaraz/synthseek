"use client";

import { Check, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";

import { BOARD_CATEGORY_KEYS } from "../ExploreBoard/constants";
import { ClampedText } from "./ClampedText";
import { LayoutMenu } from "./LayoutMenu";
import {
  cardAction,
  cardActions,
  cardBody,
  cardCategory,
  cardDescription,
  cardHead,
  cardIcon,
  cardPreview,
  cardTitle,
  galleryCard,
  onBoardBadge,
} from "./styles";
import type { WidgetGalleryCardProps } from "./types";
import { WidgetPreview } from "./WidgetPreview";

export function WidgetGalleryCard({ entry, placed, free, onAdd, onRemove, onCustomize }: WidgetGalleryCardProps) {
  const { t } = useTranslation(["discover", "widgets"]);
  const Icon = entry.definition.icon;
  const name = entry.title;
  const onBoard = placed.length > 0;

  return (
    <article className={galleryCard({ onBoard })}>
      <div className={cardPreview()}>
        <WidgetPreview widget={entry.widget} />
        {onBoard ? (
          <span className={onBoardBadge()}>
            <Check className="size-3" />
            {t("board.gallery.onBoard")}
          </span>
        ) : null}
      </div>
      <div className={cardBody()}>
        <div className={cardHead()}>
          <span className={cardIcon()}>
            <Icon className="size-4" />
          </span>
          <h4 className={cardTitle()}>{name}</h4>
          <span className={cardCategory()}>{t(BOARD_CATEGORY_KEYS[entry.definition.category].title)}</span>
        </div>
        <ClampedText text={entry.description} className={cardDescription()} />
        <div className={cardActions()}>
          {free.length > 0 ? (
            <LayoutMenu
              lists={free}
              tone="add"
              label={t("board.gallery.add")}
              ariaLabel={t("board.gallery.addNamed", { name })}
              onPick={(lists) => onAdd(entry.widget, lists)}
            />
          ) : null}
          {onBoard ? (
            <LayoutMenu
              lists={placed}
              tone="remove"
              label={t("board.gallery.remove")}
              ariaLabel={t("board.tile.remove", { name })}
              onPick={(lists) => onRemove(entry.widget, lists)}
            />
          ) : null}
          {onCustomize ? (
            <Button
              variant="ghost"
              size="sm"
              className={cardAction()}
              aria-label={t("widgets:customize.actionNamed", { name })}
              onClick={onCustomize}
            >
              <SlidersHorizontal />
              {t("widgets:customize.action")}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
