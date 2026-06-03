"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/Dialog";
import { ProgressBar } from "@components/ui/ProgressBar";
import { usePortabilityProgress } from "@hooks/api/subscriptions/usePortabilityProgress";
import { useEffect } from "react";

import { useJspfExportFull } from "../../hooks/useJspfExportFull";
import { jspfExportDialogContent } from "./styles";
import type { JspfExportDialogProps } from "./types";

export function JspfExportDialog({ request, open, onOpenChange }: JspfExportDialogProps) {
  const { jobId, start, isExporting } = useJspfExportFull(request, onOpenChange);
  const progress = usePortabilityProgress(jobId);
  const percent = progress && progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0;

  useEffect(() => {
    if (open) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={jspfExportDialogContent()}>
        <DialogTitle>Export (max compatibility)</DialogTitle>
        <DialogDescription>
          Resolving every track&apos;s MusicBrainz ID so the file matches in any app, then downloading.
        </DialogDescription>
        <div className="flex flex-col gap-2 py-2">
          <ProgressBar progress={isExporting ? percent : 100} isActive={isExporting} />
          <span className="text-fg/60 text-center text-xs">
            {progress ? `Resolving ${progress.processed}/${progress.total}` : "Preparing export..."}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
