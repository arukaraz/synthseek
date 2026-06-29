"use client";

import { countDockItems, dismissDockJob, useDockJobs } from "@hooks/api/subscriptions";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  currentItemName,
  deriveDockCardModel,
  orderDockJobs,
  providerLabelKey,
  selectActiveJob,
  titleKey,
} from "./helpers";
import { ProgressDockCard } from "./ProgressDockCard";
import { dockStack, dockViewport } from "./styles";

export function ProgressDock() {
  const { t } = useTranslation("appShell");
  const jobs = useDockJobs();
  const reduced = useReducedMotion() ?? false;

  const ordered = useMemo(() => orderDockJobs(jobs), [jobs]);
  const activeJob = useMemo(() => selectActiveJob(jobs), [jobs]);

  const [minimized, setMinimized] = useState<ReadonlySet<string>>(() => new Set());
  const [announcement, setAnnouncement] = useState("");
  const lastJobIdRef = useRef<string | null>(null);
  const lastDoneRef = useRef(0);

  const activeCounts = useMemo(
    () => (activeJob ? countDockItems(activeJob.items) : { done: 0, skipped: 0, failed: 0, total: 0 }),
    [activeJob]
  );
  const activeResolved = activeCounts.done + activeCounts.skipped + activeCounts.failed;

  useEffect(() => {
    if (!activeJob) {
      lastJobIdRef.current = null;
      lastDoneRef.current = 0;
      return;
    }

    const provider = t(providerLabelKey(activeJob.provider));
    const name = currentItemName(activeJob);
    const isNewJob = activeJob.id !== lastJobIdRef.current;
    if (isNewJob) {
      lastJobIdRef.current = activeJob.id;
      lastDoneRef.current = 0;
    }

    if (activeJob.status !== "running") {
      setAnnouncement(t(titleKey(activeJob.kind, activeJob.status), { provider, name }));
      return;
    }

    if (activeResolved > 0 && activeResolved !== lastDoneRef.current) {
      lastDoneRef.current = activeResolved;
      setAnnouncement(t("progressDock.announce.progress", { done: activeCounts.done, total: activeCounts.total }));
      return;
    }

    if (isNewJob) {
      setAnnouncement(t(titleKey(activeJob.kind, "running"), { provider, name }));
    }
  }, [activeJob, activeCounts.done, activeCounts.total, activeResolved, t]);

  const onDismiss = useCallback((jobId: string) => {
    dismissDockJob(jobId);
  }, []);

  const onToggleMinimize = useCallback((jobId: string) => {
    setMinimized((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  }, []);

  return (
    <div className={dockViewport()}>
      <div className={dockStack()}>
        <AnimatePresence initial={false}>
          {ordered.map((job) => {
            const model = deriveDockCardModel(job, t);
            return (
              <motion.div
                key={job.id}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, y: 24, scale: 0.96 }}
                animate={reduced ? {} : { opacity: 1, y: 0, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              >
                <ProgressDockCard
                  job={job}
                  counts={model.counts}
                  presentation={model.presentation}
                  controls={model.controls}
                  title={model.title}
                  subtitle={model.subtitle}
                  wrapSubtitle={model.wrapSubtitle}
                  mobileMeta={model.mobileMeta}
                  minimized={minimized.has(job.id)}
                  reduced={reduced}
                  onToggleMinimize={() => onToggleMinimize(job.id)}
                  onDismiss={() => onDismiss(job.id)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
