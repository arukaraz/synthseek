"use client";

import { MousePointer2 } from "lucide-react";

import {
  detailEmpty,
  detailEmptyArt,
  detailEmptyBody,
  detailEmptyCard,
  detailEmptyCardLine,
  detailEmptyHint,
  detailEmptyHints,
  detailEmptyKbd,
  detailEmptyTitle,
} from "../styles";

export function DetailEmptyState() {
  return (
    <div className={detailEmpty()}>
      <div className={detailEmptyArt()}>
        <span className={detailEmptyCard({ pos: "left" })}>
          <span className={detailEmptyCardLine()} />
          <span className={detailEmptyCardLine({ short: true })} />
        </span>
        <span className={detailEmptyCard({ pos: "center" })}>
          <span className={detailEmptyCardLine()} />
          <span className={detailEmptyCardLine({ short: true })} />
        </span>
        <span className={detailEmptyCard({ pos: "right" })}>
          <span className={detailEmptyCardLine()} />
          <span className={detailEmptyCardLine({ short: true })} />
        </span>
        <MousePointer2 className="absolute -bottom-2 -right-2 size-5 text-primary-300 opacity-90" />
      </div>
      <h3 className={detailEmptyTitle()}>Inspect an item</h3>
      <p className={detailEmptyBody()}>
        Click any row to see its tracks, full metadata and per-item sync configuration here.
      </p>
      <div className={detailEmptyHints()}>
        <span className={detailEmptyHint()}>
          <kbd className={detailEmptyKbd()}>↑↓</kbd> navigate
        </span>
        <span className={detailEmptyHint()}>
          <kbd className={detailEmptyKbd()}>Space</kbd> select
        </span>
        <span className={detailEmptyHint()}>
          <kbd className={detailEmptyKbd()}>Esc</kbd> clear
        </span>
      </div>
    </div>
  );
}
