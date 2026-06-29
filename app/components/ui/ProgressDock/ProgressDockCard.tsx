"use client";

import { Spinner } from "@components/ui/Spinner";
import { cn } from "@utils/cn";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { DOCK_BODY_MAX_HEIGHT } from "./constants";
import { DockItemRow } from "./DockItemRow";
import { DockRing } from "./DockRing";
import { failureReasonKey, itemStateKey, statusIconGlyph } from "./helpers";
import {
  dockBody,
  dockButtons,
  dockCard,
  dockHeader,
  dockHeaderIndicator,
  dockIconButton,
  dockMobileMeta,
  dockStatusIcon,
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
  presentation,
  controls,
  title,
  subtitle,
  wrapSubtitle,
  mobileMeta,
  minimized,
  reduced,
  onToggleMinimize,
  onDismiss,
}: ProgressDockCardProps) {
  const { t } = useTranslation("appShell");
  const showBody = controls.toggle && !minimized && counts.total > 0;
  const StatusIcon = presentation.indicator === "status-icon" ? statusIconGlyph(presentation.status) : null;

  return (
    <div className={dockCard({ status: job.status })}>
      <div className={dockHeader()}>
        {presentation.indicator === "ring" ? (
          <DockRing ratio={presentation.ratio} percent={presentation.percent} status={job.status} />
        ) : null}
        {presentation.indicator === "spinner" ? (
          <span className={dockHeaderIndicator()} aria-hidden="true">
            <Spinner size="md" decorative />
          </span>
        ) : null}
        {presentation.indicator === "status-icon" && StatusIcon ? (
          <span className={dockHeaderIndicator()} aria-hidden="true">
            <StatusIcon className={dockStatusIcon({ status: presentation.status })} />
          </span>
        ) : null}

        <div className={dockTitleBlock()}>
          <p className={dockTitle()}>{title}</p>
          <p className={dockSubtitle({ wrap: wrapSubtitle })}>
            <span className="hidden sm:inline">
              {subtitle.accent ? (
                <>
                  <span className={subtitle.accentTone === "error" ? dockSubtitleCountFailed() : dockSubtitleCount()}>
                    {subtitle.accent}
                  </span>{" "}
                </>
              ) : null}
              {subtitle.rest}
            </span>
            <span className={cn(dockMobileMeta(), "sm:hidden")}>{mobileMeta}</span>
          </p>
        </div>

        <div className={dockButtons()}>
          {controls.toggle ? (
            <button
              type="button"
              className={dockIconButton()}
              onClick={onToggleMinimize}
              aria-label={minimized ? t("progressDock.expand") : t("progressDock.minimize")}
              aria-expanded={!minimized}
            >
              {minimized ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          ) : null}
          {controls.close ? (
            <button
              type="button"
              className={dockIconButton()}
              onClick={onDismiss}
              aria-label={t("progressDock.dismiss")}
            >
              <X className="size-4" />
            </button>
          ) : null}
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
                  <DockItemRow
                    item={item}
                    reduced={reduced}
                    label={t(itemStateKey(item.state))}
                    reasonLabel={t(failureReasonKey(item.reason))}
                    skippedLabel={t("progressDock.itemSkippedReason")}
                  />
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
