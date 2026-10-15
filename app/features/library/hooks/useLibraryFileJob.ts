"use client";

import { useLibraryFilesStatus, useRefreshLibraryAfterFileJob } from "@hooks/api/queries/useLibraryFiles";
import type { LibraryFilesStatus } from "@hooks/api/queries/library/types";
import { useCallback, useEffect, useState } from "react";

import { fileJobReport } from "../helpers";
import type { LibraryFileJob, LibraryFileJobKind } from "../types";

export function useLibraryFileJob(
  enabled: boolean,
  onSettled: (job: LibraryFileJob, status: LibraryFilesStatus) => void
) {
  const [job, setJob] = useState<LibraryFileJob | null>(null);
  const status = useLibraryFilesStatus(enabled, job !== null);
  const refresh = useRefreshLibraryAfterFileJob();
  const report = fileJobReport(job, status.data, status.dataUpdatedAt);
  const baseline = status.data?.startedAt ?? null;

  useEffect(() => {
    if (job === null || report === null || report.running) return;
    refresh();
    onSettled(job, report);
    setJob(null);
  }, [job, report, refresh, onSettled]);

  const begin = useCallback(
    (kind: LibraryFileJobKind) => setJob({ ...kind, baseline, since: Date.now(), visible: true }),
    [baseline]
  );

  const hide = useCallback(() => setJob((current) => (current === null ? null : { ...current, visible: false })), []);

  return { job, report, begin, hide };
}
