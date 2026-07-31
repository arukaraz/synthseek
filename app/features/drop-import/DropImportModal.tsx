"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/Dialog";
import type { DropImportRejectedEntry, DropImportUploadResult } from "@hooks/api";

import { BatchDetail } from "./components/BatchDetail";
import { BatchList } from "./components/BatchList";
import { RejectedFilesList } from "./components/RejectedFilesList";
import { UploadPanel } from "./components/UploadPanel";
import { modalBody, modalContent, modalHeader, overviewContainer } from "./styles";
import type { DropImportModalProps } from "./types";

export function DropImportModal({ open, onOpenChange }: DropImportModalProps) {
  const { t } = useTranslation("library");
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [rejected, setRejected] = useState<DropImportRejectedEntry[]>([]);

  useEffect(() => {
    if (!open) {
      setActiveBatchId(null);
      setRejected([]);
    }
  }, [open]);

  const handleResult = (result: DropImportUploadResult) => {
    setRejected(result.rejected);
    if (result.ok) setActiveBatchId(result.batchId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={modalContent()}>
        <div className={modalBody()}>
          <div className={modalHeader()}>
            <DialogTitle>{t("dropImport.modal.title")}</DialogTitle>
            <DialogDescription>{t("dropImport.modal.description")}</DialogDescription>
          </div>

          {activeBatchId ? (
            <BatchDetail
              batchId={activeBatchId}
              rejected={rejected}
              onBack={() => {
                setActiveBatchId(null);
                setRejected([]);
              }}
            />
          ) : (
            <div className={overviewContainer()}>
              <UploadPanel onResult={handleResult} />
              <RejectedFilesList entries={rejected} />
              <BatchList onOpenBatch={setActiveBatchId} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
