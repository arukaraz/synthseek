"use client";

import { Check, Plus, SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";

import { BOARD_CATEGORY_KEYS } from "../ExploreBoard/constants";
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

export function WidgetGalleryCard({ entry, tileId, onAdd, onRemove, onCustomize }: WidgetGalleryCardProps) {
  const { t } = useTranslation(["discover", "widgets"]);
  const Icon = entry.definition.icon;
  const name = entry.title;

  return (
    <article className={galleryCard({ onBoard: tileId !== undefined })}>
      <div className={cardPreview()}>
        <WidgetPreview widget={entry.widget} />
        {tileId !== undefined ? (
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
        <p className={cardDescription()}>{entry.description}</p>
        <div className={cardActions()}>
          {tileId !== undefined ? (
            <Button
              variant="ghost"
              size="sm"
              className={cardAction()}
              aria-label={t("board.tile.remove", { name })}
              onClick={() => onRemove(tileId)}
            >
              <X />
              {t("board.gallery.remove")}
            </Button>
          ) : (
            <Button
              size="sm"
              className={cardAction()}
              aria-label={t("board.gallery.addNamed", { name })}
              onClick={() => onAdd(entry.widget)}
            >
              <Plus />
              {t("board.gallery.add")}
            </Button>
          )}
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
