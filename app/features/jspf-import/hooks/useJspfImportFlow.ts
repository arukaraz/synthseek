import { useImportCommit } from "@hooks/api/mutations/portability/useImportCommit";
import { useImportPreview } from "@hooks/api/mutations/portability/useImportPreview";
import { buildDockItems, deriveTerminalStatus, seedDockJob, setDockJobStatus } from "@hooks/api/subscriptions";
import { useCallback, useEffect, useState } from "react";

import { buildSelectionArray, generateJobId, trackKey } from "../helpers";
import type { ImportFormat, ImportStep } from "../types";

interface LoadedSource {
  content: string;
  format: ImportFormat;
  filename: string;
}

export function useJspfImportFlow(onOpenChange: (open: boolean) => void) {
  const [step, setStep] = useState<ImportStep>("source");
  const [source, setSource] = useState<LoadedSource | null>(null);
  const [jobId, setJobId] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const preview = useImportPreview();
  const commit = useImportCommit();

  useEffect(() => {
    const data = preview.data;
    if (!data) return;
    const next = new Set<string>();
    data.collections.forEach((collection, collectionIndex) =>
      collection.tracks.forEach((track, trackIndex) => {
        if (track.matched) next.add(trackKey(collectionIndex, trackIndex));
      })
    );
    setSelected(next);
  }, [preview.data]);

  const loadPayload = useCallback(
    (content: string, format: ImportFormat, filename: string) => {
      const id = generateJobId();
      setSource({ content, format, filename });
      setJobId(id);
      setStep("preview");
      preview.mutate({ content, format, filename, jobId: id });
    },
    [preview]
  );

  const toggleTrack = useCallback((collectionIndex: number, trackIndex: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const key = trackKey(collectionIndex, trackIndex);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const confirm = useCallback(() => {
    const data = preview.data;
    if (!source || !data) return;
    const selection = buildSelectionArray(data, selected);

    seedDockJob({
      id: jobId,
      kind: "file-import",
      items: buildDockItems(
        data.collections.map((collection, index) => ({ key: String(index), name: collection.name }))
      ),
      status: "running",
    });
    onOpenChange(false);

    commit.mutate(
      { ...source, jobId, selection },
      {
        onSuccess: (report) => setDockJobStatus(jobId, deriveTerminalStatus(report.imported, report.failed)),
        onError: () => setDockJobStatus(jobId, "failed"),
      }
    );
  }, [commit, source, jobId, onOpenChange, preview.data, selected]);

  const back = useCallback(() => {
    preview.reset();
    setStep("source");
  }, [preview]);

  const reset = useCallback(() => {
    preview.reset();
    commit.reset();
    setSource(null);
    setJobId("");
    setSelected(new Set());
    setStep("source");
  }, [preview, commit]);

  return {
    step,
    jobId,
    preview: preview.data,
    isPreviewing: preview.isPending,
    isCommitting: commit.isPending,
    errorMessage: preview.error?.message ?? null,
    selected,
    toggleTrack,
    loadPayload,
    confirm,
    back,
    reset,
  };
}
