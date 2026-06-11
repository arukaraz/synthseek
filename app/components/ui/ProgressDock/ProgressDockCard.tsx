"use client";

import { cn } from "@utils/cn";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { DOCK_BODY_MAX_HEIGHT } from "./constants";
import { DockItemRow } from "./DockItemRow";
import { DockRing } from "./DockRing";
import { itemStateKey } from "./helpers";
import {
  dockBody,
  dockButtons,
  dockCard,
  dockHeader,
  dockIconButton,
  dockMobileMeta,
  dockSubtitle,
  dockSubtitleCount,
  dockSubtitleCountFailed,
  dockTitle,
  dockTitleBlock,
} from "./styles";
import type { ProgressDockCardProps } from "./types";

export function ProgressDockCard({
  job,
  counts,
  ratio,
  percent,
  title,
  subtitle,
  mobileMeta,
  minimized,
  reduced,
  onToggleMinimize,
  onDismiss,
}: ProgressDockCardProps) {
  const { t } = useTranslation("appShell");
  const showBody = !minimized && counts.total > 0;

  return (
    <div className={dockCard({ status: job.status })}>
      <div className={dockHeader()}>
        <DockRing ratio={ratio} percent={percent} status={job.status} />

        <div className={dockTitleBlock()}>
          <p className={dockTitle()}>{title}</p>
          <p className={dockSubtitle()}>
            <span className="hidden sm:inline">
              <span className={subtitle.accentTone === "error" ? dockSubtitleCountFailed() : dockSubtitleCount()}>
                {subtitle.accent}
              </span>{" "}
              {subtitle.rest}
            </span>
            <span className={cn(dockMobileMeta(), "sm:hidden")}>{mobileMeta}</span>
          </p>
        </div>

        <div className={dockButtons()}>
          <button
            type="button"
            className={dockIconButton()}
            onClick={onToggleMinimize}
            aria-label={minimized ? t("progressDock.expand") : t("progressDock.minimize")}
            aria-expanded={!minimized}
          >
            {minimized ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
          <button type="button" className={dockIconButton()} onClick={onDismiss} aria-label={t("progressDock.dismiss")}>
            <X className="size-4" />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showBody ? (
          <motion.div
            key="dock-body"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={reduced ? {} : { height: "auto", opacity: 1 }}
            exit={reduced ? {} : { height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="hidden sm:block"
          >
            <ul className={dockBody()} style={{ maxHeight: DOCK_BODY_MAX_HEIGHT }}>
              {job.items.map((item) => (
                <li key={item.key}>
                  <DockItemRow item={item} reduced={reduced} label={t(itemStateKey(item.state))} />
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
