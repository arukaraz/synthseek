"use client";

import { Download, Play } from "lucide-react";

import { CoverArt } from "./CoverArt";
import {
  widgetRow,
  widgetRowCopy,
  widgetRowCover,
  widgetRowCoverAction,
  widgetRowLead,
  widgetRowMain,
  widgetRowSubtitle,
  widgetRowTitle,
  widgetRowTrailing,
} from "./styles";
import type { WidgetRowProps } from "./types";

export function WidgetRow({ cover, seed, title, subtitle, lead, trailing, onSelect, coverAction }: WidgetRowProps) {
  const copy = (
    <span className={widgetRowCopy()}>
      <span className={widgetRowTitle()}>{title}</span>
      <span className={widgetRowSubtitle()}>{subtitle}</span>
    </span>
  );

  return (
    <li className={widgetRow({ interactive: onSelect !== undefined })}>
      {lead === undefined ? null : <span className={widgetRowLead()}>{lead}</span>}
      <span className={widgetRowCover()}>
        <CoverArt src={cover} seed={seed} sizes="40px" />
        {coverAction ? (
          <button
            type="button"
            className={widgetRowCoverAction()}
            aria-label={coverAction.label}
            onClick={coverAction.onClick}
          >
            {coverAction.kind === "play" ? <Play /> : <Download />}
          </button>
        ) : null}
      </span>
      {onSelect ? (
        <button type="button" className={widgetRowMain({ interactive: true })} onClick={onSelect}>
          {copy}
        </button>
      ) : (
        <span className={widgetRowMain()}>{copy}</span>
      )}
      {trailing === undefined ? null : <span className={widgetRowTrailing()}>{trailing}</span>}
    </li>
  );
}
