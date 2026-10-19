"use client";

import { Check, Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { InfoTooltip } from "@components/ui/InfoTooltip";

import { cardFooter, cardIcon, cardPreview, cardTitle, cardTitleRow, galleryCard, onBoardBadge } from "./styles";
import type { WidgetGalleryCardProps } from "./types";
import { WidgetPreview } from "./WidgetPreview";

export function WidgetGalleryCard({ entry, tileId, onAdd, onRemove }: WidgetGalleryCardProps) {
  const { t } = useTranslation("discover");
  const Icon = entry.definition.icon;
  const name = entry.title;

  return (
    <article className={galleryCard({ onBoard: tileId !== undefined })}>
      <div className={cardPreview()}>
        <WidgetPreview widget={entry.widget} info={entry.description} />
        {tileId !== undefined ? (
          <span className={onBoardBadge()}>
            <Check className="size-3" />
            {t("board.gallery.onBoard")}
          </span>
        ) : null}
      </div>
      <div className={cardFooter()}>
        <span className={cardIcon()}>
          <Icon className="size-4" />
        </span>
        <div className={cardTitleRow()}>
          <h4 className={cardTitle()}>{name}</h4>
          <InfoTooltip title={name} description={entry.description} />
        </div>
        {tileId !== undefined ? (
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("board.tile.remove", { name })}
            onClick={() => onRemove(tileId)}
          >
            <X />
            {t("board.gallery.remove")}
          </Button>
        ) : (
          <Button size="sm" aria-label={t("board.gallery.addNamed", { name })} onClick={() => onAdd(entry.widget)}>
            <Plus />
            {t("board.gallery.add")}
          </Button>
        )}
      </div>
    </article>
  );
}
