"use client";

import { Button } from "@components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/Dialog";
import { ProgressBar } from "@components/ui/ProgressBar";
import { useTranslation } from "react-i18next";

import { jobPercent } from "./helpers";
import { flowFooter, progressBody, progressCount } from "./styles";
import type { FileJobDialogProps } from "./types";

export function FileJobDialog({ job, report, onHide }: FileJobDialogProps) {
  const { t } = useTranslation("library");
  const percent = jobPercent(report);
  const title = job.kind === "move" ? t("files.progress.move", { label: job.targetLabel }) : t("files.progress.delete");

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onHide();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t("files.progress.hint")}</DialogDescription>
        </DialogHeader>

        <div className={progressBody()}>
          <div role="progressbar" aria-label={title} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
            <ProgressBar progress={percent} isActive />
          </div>
          <p className={progressCount()} aria-live="polite">
            {report === null
              ? t("files.progress.starting")
              : t("files.progress.count", { processed: report.processed, total: report.total })}
          </p>
        </div>

        <DialogFooter className={flowFooter()}>
          <Button variant="ghost" onClick={onHide}>
            {t("files.progress.hide")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
