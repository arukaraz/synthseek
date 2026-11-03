"use client";

import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/Dialog";
import { formatBytes } from "@utils/formatters";

import { dupRejectHeading, dupRejectList, dupRejectOption, dupRejectOptions } from "../../styles";
import type { RejectCopiesDialogProps } from "./types";

export function RejectCopiesDialog({ group, pending, onCancel, onConfirm }: RejectCopiesDialogProps) {
  const { t } = useTranslation(["settings", "common"]);
  const count = group?.copies.length ?? 0;
  const size = formatBytes(group?.copies.reduce((total, copy) => total + copy.sizeBytes, 0) ?? 0);

  return (
    <Dialog open={group !== null} onOpenChange={(open) => (open ? undefined : onCancel())}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("libraryScan.duplicates.reject.title", { count, title: group?.title ?? "" })}</DialogTitle>
        </DialogHeader>
        <div className={dupRejectOptions()}>
          <div className={dupRejectOption()}>
            <h4 className={dupRejectHeading()}>{t("libraryScan.duplicates.reject.rejectHeading")}</h4>
            <ul className={dupRejectList()}>
              <li>{t("libraryScan.duplicates.reject.recycles", { count, size })}</li>
              <li>{t("libraryScan.duplicates.reject.quarantines")}</li>
              <li>{t("libraryScan.duplicates.reject.fails")}</li>
            </ul>
            <Button variant="destructive" size="sm" disabled={pending} onClick={() => onConfirm(false)}>
              {pending ? <Loader2 className="animate-spin" /> : null}
              {t("libraryScan.duplicates.reject.rejectAction")}
            </Button>
          </div>
          <div className={dupRejectOption()}>
            <h4 className={dupRejectHeading()}>{t("libraryScan.duplicates.reject.searchHeading")}</h4>
            <ul className={dupRejectList()}>
              <li>{t("libraryScan.duplicates.reject.same")}</li>
              <li>{t("libraryScan.duplicates.reject.searches")}</li>
              <li>{t("libraryScan.duplicates.reject.nothingLeft")}</li>
            </ul>
            <Button variant="destructive" size="sm" disabled={pending} onClick={() => onConfirm(true)}>
              {pending ? <Loader2 className="animate-spin" /> : null}
              {t("libraryScan.duplicates.reject.searchAction")}
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            {t("common:cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
