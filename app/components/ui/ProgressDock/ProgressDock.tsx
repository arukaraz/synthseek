"use client";

import { countDockItems, dismissDockJob, useDockJobs } from "@hooks/api/subscriptions";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { clampRatio, currentItemName, providerLabelKey, selectActiveJob, titleKey } from "./helpers";
import { ProgressDockCard } from "./ProgressDockCard";
import { dockViewport } from "./styles";

export function ProgressDock() {
  const { t } = useTranslation("appShell");
  const jobs = useDockJobs();
  const reduced = useReducedMotion() ?? false;

  const job = useMemo(() => selectActiveJob(jobs), [jobs]);

  const [minimized, setMinimized] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const lastJobIdRef = useRef<string | null>(null);
  const lastDoneRef = useRef(0);

  const counts = useMemo(() => (job ? countDockItems(job.items) : { done: 0, failed: 0, total: 0 }), [job]);
  const ratio = clampRatio(counts.done + counts.failed, counts.total);
  const percent = Math.round(ratio * 100);

  useEffect(() => {
    if (!job) {
      lastJobIdRef.current = null;
      lastDoneRef.current = 0;
      return;
    }

    const provider = t(providerLabelKey(job.provider));
    const isNewJob = job.id !== lastJobIdRef.current;
    if (isNewJob) {
      lastJobIdRef.current = job.id;
      lastDoneRef.current = 0;
      setMinimized(false);
    }

    if (job.status !== "running") {
      setAnnouncement(t(titleKey(job.kind, job.status), { provider }));
      return;
    }

    const resolved = counts.done + counts.failed;
    if (resolved > 0 && resolved !== lastDoneRef.current) {
      lastDoneRef.current = resolved;
      setAnnouncement(t("progressDock.announce.progress", { done: counts.done, total: counts.total }));
      return;
    }

    if (isNewJob) {
      setAnnouncement(t(titleKey(job.kind, "running"), { provider }));
    }
  }, [job, counts.done, counts.failed, counts.total, t]);

  const onDismiss = useCallback(() => {
    if (job) dismissDockJob(job.id);
  }, [job]);

  const onToggleMinimize = useCallback(() => setMinimized((prev) => !prev), []);

  if (!job) {
    return (
      <div className={dockViewport()}>
        <span role="status" aria-live="polite" className="sr-only">
          {announcement}
        </span>
      </div>
    );
  }

  const title = t(titleKey(job.kind, job.status), { provider: t(providerLabelKey(job.provider)) });
  const subtitle =
    counts.failed > 0
      ? { accent: String(counts.failed), accentTone: "error" as const, rest: t("progressDock.subtitle.failed") }
      : {
          accent: String(counts.done),
          accentTone: "sync" as const,
          rest: t("progressDock.subtitle.ofTotal", { total: counts.total }),
        };
  const mobileMeta = t("progressDock.mobileMeta", {
    done: counts.done,
    total: counts.total,
    current: currentItemName(job),
  });

  return (
    <div className={dockViewport()}>
      <AnimatePresence>
        <motion.div
          key={job.id}
          initial={reduced ? false : { opacity: 0, y: 24, scale: 0.96 }}
          animate={reduced ? {} : { opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        >
          <ProgressDockCard
            job={job}
            counts={counts}
            ratio={ratio}
            percent={percent}
            title={title}
            subtitle={subtitle}
            mobileMeta={mobileMeta}
            minimized={minimized}
            reduced={reduced}
            onToggleMinimize={onToggleMinimize}
            onDismiss={onDismiss}
          />
        </motion.div>
      </AnimatePresence>

      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
