"use client";

import { Braces, Check, Copy, ListMusic, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { IconButton } from "@components/ui/IconButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/Tooltip";

import { widgetIconOf } from "../CustomWidget/helpers";
import { ClampedText } from "./ClampedText";
import { CustomWidgetPreview } from "./CustomWidgetPreview";
import { LayoutMenu } from "./LayoutMenu";
import { LockedAction } from "./LockedAction";
import {
  cardIcon,
  cardPreview,
  mineAccent,
  mineActions,
  mineActionsEnd,
  mineBasedOn,
  mineBody,
  mineCard,
  mineDescription,
  mineHead,
  mineMeta,
  minePlaylist,
  mineTitle,
  onBoardPill,
} from "./styles";
import type { MyWidgetCardProps } from "./types";

export function MyWidgetCard({
  widget,
  free,
  templateStaged,
  onAdd,
  onEdit,
  onDuplicate,
  onCopyJson,
  onDelete,
}: MyWidgetCardProps) {
  const { t } = useTranslation("widgets");
  const Icon = widgetIconOf(widget.meta.icon);
  const name = widget.meta.name;
  const accent = t(`accents.${widget.meta.accent}`);
  const playlist = widget.playlist
    ? t("mine.playlist", { refresh: t(`playlist.refreshes.${widget.playlist.refresh}`) })
    : null;

  return (
    <article className={mineCard()} aria-label={name}>
      <div className={cardPreview()}>
        <CustomWidgetPreview widget={widget} />
      </div>
      <div className={mineBody()}>
        <div className={mineHead()}>
          <span className={cardIcon()}>
            <Icon className="size-4" aria-hidden />
          </span>
          <h4 className={mineTitle()}>{name}</h4>
          {playlist ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={minePlaylist()} role="img" aria-label={playlist} tabIndex={0}>
                  <ListMusic className="size-4" aria-hidden />
                </span>
              </TooltipTrigger>
              <TooltipContent>{playlist}</TooltipContent>
            </Tooltip>
          ) : null}
          <IconButton
            icon={Braces}
            size="lg"
            variant="ghost"
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
        {widget.meta.description ? <ClampedText text={widget.meta.description} className={mineDescription()} /> : null}
        <p className={mineMeta()}>
          {t("mine.meta", { view: t(`blocks.${widget.view.block}`), kind: t(`kinds.${widget.query.type}`) })}
        </p>
        {widget.basedOn ? <p className={mineBasedOn()}>{t("mine.basedOn", { name: widget.basedOn })}</p> : null}
        <div className={mineActions()}>
          {free.length === 0 ? (
            <span className={onBoardPill()}>
              <Check className="size-3.5" aria-hidden />
              {t("mine.onBoard")}
            </span>
          ) : (
            <LayoutMenu
              lists={free}
              tone="add"
              label={t("mine.addToBoard")}
              ariaLabel={t("mine.addNamed", { name })}
              onPick={onAdd}
              lockedHint={templateStaged ? t("mine.addWhileTemplate") : undefined}
            />
          )}
          <Button variant="ghost" size="sm" aria-label={t("mine.editNamed", { name })} onClick={onEdit}>
            <Pencil />
            {t("mine.edit")}
          </Button>
          <span className={mineActionsEnd()}>
            <IconButton
              icon={Copy}
              size="lg"
              variant="ghost"
              animated={false}
              aria-label={t("mine.duplicateNamed", { name })}
              title={t("mine.duplicate")}
              onClick={onDuplicate}
            />
            {templateStaged ? (
              <LockedAction label={t("mine.deleteNamed", { name })} hint={t("mine.deleteWhileTemplate")}>
                <IconButton
                  icon={Trash2}
                  size="lg"
                  variant="ghostRed"
                  animated={false}
                  aria-label={t("mine.deleteNamed", { name })}
                  aria-hidden
                  tabIndex={-1}
                  disabled
                />
              </LockedAction>
            ) : (
              <IconButton
                icon={Trash2}
                size="lg"
                variant="ghostRed"
                animated={false}
                aria-label={t("mine.deleteNamed", { name })}
                title={t("mine.delete")}
                onClick={onDelete}
              />
            )}
          </span>
        </div>
      </div>
    </article>
  );
}
