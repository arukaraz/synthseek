"use client";

import { MousePointer2 } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("library");

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
        <MousePointer2 className="text-primary-400 absolute -right-2 -bottom-2 size-5 opacity-90" />
      </div>
      <h3 className={detailEmptyTitle()}>{t("librarySource.emptyState.title")}</h3>
      <p className={detailEmptyBody()}>{t("librarySource.emptyState.body")}</p>
      <div className={detailEmptyHints()}>
        <span className={detailEmptyHint()}>
          <kbd className={detailEmptyKbd()}>↑↓</kbd> {t("librarySource.emptyState.navigate")}
        </span>
        <span className={detailEmptyHint()}>
          <kbd className={detailEmptyKbd()}>{t("librarySource.emptyState.keySpace")}</kbd>{" "}
          {t("librarySource.emptyState.select")}
        </span>
        <span className={detailEmptyHint()}>
          <kbd className={detailEmptyKbd()}>{t("librarySource.emptyState.keyEsc")}</kbd>{" "}
          {t("librarySource.emptyState.clear")}
        </span>
      </div>
    </div>
  );
}
