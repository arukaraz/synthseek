"use client";

import { Reorder, useDragControls } from "framer-motion";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { useTranslation } from "react-i18next";

import { statusDot } from "../../styles";
import {
  chainArrow,
  chainArrows,
  chainGrip,
  chainHit,
  chainItem,
  chainItemBody,
  chainItemStatus,
  chainItemTitle,
} from "./styles";
import type { ChainItemProps } from "./types";

export function ChainItem<K extends string>({
  entry,
  badge,
  selected,
  reorderable,
  onSelect,
  onMoveUp,
  onMoveDown,
}: ChainItemProps<K>) {
  const { t } = useTranslation("settings");
  const controls = useDragControls();

  const body = (
    <>
      <button
        type="button"
        className={chainHit()}
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={t("shell.chain.open", { name: entry.title })}
      />
      {reorderable ? (
        <span
          className={chainGrip()}
          onPointerDown={(event) => controls.start(event)}
          aria-label={t("shell.chain.drag", { name: entry.title })}
          role="img"
        >
          <GripVertical className="size-4" />
        </span>
      ) : null}
      {badge}
      <span className={chainItemBody()}>
        <span className={chainItemTitle()}>{entry.title}</span>
        {entry.status ? (
          <span className={chainItemStatus({ tone: entry.status.tone })}>
            <span className={statusDot({ tone: entry.status.tone })} />
            {entry.status.label}
          </span>
        ) : null}
      </span>
      {reorderable ? (
        <span className={chainArrows()}>
          <button
            type="button"
            className={chainArrow()}
            onClick={onMoveUp}
            disabled={onMoveUp === undefined}
            aria-label={t("shell.chain.moveUp", { name: entry.title })}
          >
            <ChevronUp className="size-3.5" />
          </button>
          <button
            type="button"
            className={chainArrow()}
            onClick={onMoveDown}
            disabled={onMoveDown === undefined}
            aria-label={t("shell.chain.moveDown", { name: entry.title })}
          >
            <ChevronDown className="size-3.5" />
          </button>
        </span>
      ) : null}
    </>
  );

  if (!reorderable) return <li className={chainItem({ selected })}>{body}</li>;

  return (
    <Reorder.Item
      value={entry.key}
      as="li"
      className={chainItem({ selected })}
      dragListener={false}
      dragControls={controls}
    >
      {body}
    </Reorder.Item>
  );
}
