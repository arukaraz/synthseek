"use client";

import { type KeyboardEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Dialog, DialogContent, DialogTitle } from "@components/ui/Dialog";

import { CardProgress } from "./CardProgress";
import { HighlightCard } from "./HighlightCard";
import { SummaryCard } from "./SummaryCard";
import { cardTotal, clampCard } from "./helpers";
import {
  body,
  dialogRoot,
  footer,
  footerCount,
  footerTitle,
  ghostButton,
  header,
  heading,
  primaryButton,
  versionPill,
} from "./styles";
import type { WhatsNewDialogProps } from "./types";

export function WhatsNewDialog({ entry, open, onOpenChange }: WhatsNewDialogProps) {
  const { t } = useTranslation("settings");
  const [index, setIndex] = useState(0);
  const primaryRef = useRef<HTMLButtonElement>(null);

  const highlights = entry.highlights ?? [];
  const total = cardTotal(entry);
  const current = clampCard(index, total);
  const highlight = highlights[current];
  const last = current === total - 1;

  const handleOpenChange = (next: boolean) => {
    if (!next) setIndex(0);
    onOpenChange(next);
  };
  const close = () => handleOpenChange(false);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") setIndex(clampCard(current + 1, total));
    if (event.key === "ArrowLeft") setIndex(clampCard(current - 1, total));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        animation="panel"
        className={dialogRoot()}
        onKeyDown={handleKeyDown}
        aria-describedby={undefined}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          primaryRef.current?.focus();
        }}
      >
        <div className={header()}>
          <DialogTitle className={heading()}>{t("updates.whatsNew.heading")}</DialogTitle>
          <span className={versionPill()}>{t("updates.versionTag", { version: entry.version })}</span>
        </div>

        {total > 1 ? <CardProgress total={total} current={current} onSelect={setIndex} /> : null}

        <div className={body()} aria-live="polite">
          {highlight ? (
            <HighlightCard key={current} highlight={highlight} onNavigate={close} />
          ) : (
            <SummaryCard entry={entry} hasHighlights={highlights.length > 0} onNavigate={close} />
          )}
        </div>

        <div className={footer()}>
          {current > 0 ? (
            <button type="button" className={ghostButton()} onClick={() => setIndex(current - 1)}>
              {t("updates.whatsNew.back")}
            </button>
          ) : (
            <span className={footerTitle()}>{entry.title}</span>
          )}
          {total > 1 ? (
            <span className={footerCount()}>{t("updates.whatsNew.position", { current: current + 1, total })}</span>
          ) : null}
          {last ? (
            <button ref={primaryRef} type="button" className={primaryButton()} onClick={close}>
              {t("updates.whatsNew.done")}
            </button>
          ) : (
            <button ref={primaryRef} type="button" className={primaryButton()} onClick={() => setIndex(current + 1)}>
              {t("updates.whatsNew.next")}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
