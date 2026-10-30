"use client";

import { Check, Copy, FileJson, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { IconButton } from "@components/ui/IconButton";

import { widgetIconOf } from "../CustomWidget/helpers";
import {
  cardIcon,
  mineAccent,
  mineActions,
  mineActionsEnd,
  mineBasedOn,
  mineCard,
  mineHead,
  mineMeta,
  mineTitle,
  onBoardPill,
} from "./styles";
import type { MyWidgetCardProps } from "./types";

export function MyWidgetCard({ widget, tiles, onAdd, onEdit, onDuplicate, onCopyJson, onDelete }: MyWidgetCardProps) {
  const { t } = useTranslation("widgets");
  const Icon = widgetIconOf(widget.meta.icon);
  const name = widget.meta.name;
  const accent = t(`accents.${widget.meta.accent}`);

  return (
    <article className={mineCard()} aria-label={name}>
      <div className={mineHead()}>
        <span className={cardIcon()}>
          <Icon className="size-4" aria-hidden />
        </span>
        <h4 className={mineTitle()}>{name}</h4>
        <IconButton
          icon={FileJson}
          size="sm"
          animated={false}
          aria-label={t("mine.jsonNamed", { name })}
          title={t("mine.json")}
          onClick={onCopyJson}
        />
        <span
          data-acc={widget.meta.accent}
          className={mineAccent()}
          role="img"
          aria-label={t("mine.accent", { accent })}
          title={accent}
        />
      </div>
      <p className={mineMeta()}>
        {t("mine.meta", { view: t(`blocks.${widget.view.block}`), kind: t(`kinds.${widget.query.type}`) })}
      </p>
      {widget.basedOn ? <p className={mineBasedOn()}>{t("mine.basedOn", { name: widget.basedOn })}</p> : null}
      {widget.playlist ? (
        <p className={mineBasedOn()}>
          {t("mine.playlist", { refresh: t(`playlist.refreshes.${widget.playlist.refresh}`) })}
        </p>
      ) : null}
      <div className={mineActions()}>
        {tiles > 0 ? (
          <span className={onBoardPill()}>
            <Check className="size-3.5" aria-hidden />
            {t("mine.onBoard")}
          </span>
        ) : (
          <Button size="sm" aria-label={t("mine.addNamed", { name })} onClick={onAdd}>
            <Plus />
            {t("mine.addToBoard")}
          </Button>
        )}
        <Button variant="ghost" size="sm" aria-label={t("mine.editNamed", { name })} onClick={onEdit}>
          <Pencil />
          {t("mine.edit")}
        </Button>
        <span className={mineActionsEnd()}>
          <IconButton
            icon={Copy}
            size="sm"
            animated={false}
            aria-label={t("mine.duplicateNamed", { name })}
            title={t("mine.duplicate")}
            onClick={onDuplicate}
          />
          <IconButton
            icon={Trash2}
            size="sm"
            animated={false}
            variant="red"
            aria-label={t("mine.deleteNamed", { name })}
            title={t("mine.delete")}
            onClick={onDelete}
          />
        </span>
      </div>
    </article>
  );
}
