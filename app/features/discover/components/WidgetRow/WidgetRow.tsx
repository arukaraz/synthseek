"use client";

import { CoverArt } from "./CoverArt";
import {
  widgetRow,
  widgetRowCopy,
  widgetRowCover,
  widgetRowLead,
  widgetRowMain,
  widgetRowSubtitle,
  widgetRowTitle,
  widgetRowTrailing,
} from "./styles";
import type { WidgetRowProps } from "./types";

export function WidgetRow({ cover, seed, title, subtitle, lead, trailing, round = false, onSelect }: WidgetRowProps) {
  const main = (
    <>
      <span className={widgetRowCover({ round })}>
        <CoverArt src={cover} seed={seed} sizes="40px" />
      </span>
      <span className={widgetRowCopy()}>
        <span className={widgetRowTitle()}>{title}</span>
        <span className={widgetRowSubtitle()}>{subtitle}</span>
      </span>
    </>
  );

  return (
    <li className={widgetRow()}>
      {lead === undefined ? null : <span className={widgetRowLead()}>{lead}</span>}
      {onSelect ? (
        <button type="button" className={widgetRowMain({ interactive: true })} onClick={onSelect}>
          {main}
        </button>
      ) : (
        <span className={widgetRowMain()}>{main}</span>
      )}
      {trailing === undefined ? null : <span className={widgetRowTrailing()}>{trailing}</span>}
    </li>
  );
}
