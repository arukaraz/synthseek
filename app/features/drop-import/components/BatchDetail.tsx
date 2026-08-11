"use client";

import { ArrowLeft } from "lucide-react";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";

import { DropImportBatchStatus, DropImportFileStatus } from "@api/__generated__/types";
import { IconButton } from "@components/ui/IconButton";
import { ProgressBar } from "@components/ui/ProgressBar";
import { Spinner } from "@components/ui/Spinner";
import { useDropImportBatch } from "@hooks/api";

import { batchProcessedCount, batchProgressPercent } from "../helpers";
import { detailCounts, detailHeader, errorText, fileList } from "../styles";
import type { BatchDetailProps } from "../types";
import { BatchStatusBadge } from "./BatchStatusBadge";
import { FileRow } from "./FileRow";
import { MatchSearchPanel } from "./MatchSearchPanel";
import { RejectedFilesList } from "./RejectedFilesList";

export function BatchDetail({ batchId, rejected, onBack }: BatchDetailProps) {
  const { t } = useTranslation("library");
  const batch = useDropImportBatch(batchId);
  const [matchFileId, setMatchFileId] = useState<string | null>(null);

  if (batch.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (batch.isError || !batch.data) {
    return (
      <div className="flex flex-col items-start gap-2">
        <IconButton icon={ArrowLeft} size="sm" aria-label={t("dropImport.detail.back")} onClick={onBack} />
        <span className={errorText()}>{t("dropImport.detail.loadError")}</span>
      </div>
    );
  }

  const data = batch.data;
  const isProcessing =
    data.status === DropImportBatchStatus.enum.queued || data.status === DropImportBatchStatus.enum.processing;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className={detailHeader()}>
        <IconButton icon={ArrowLeft} size="sm" aria-label={t("dropImport.detail.back")} onClick={onBack} />
        <BatchStatusBadge status={data.status} />
        <span className="text-fg text-sm font-medium">
          {t("dropImport.detail.title", { processed: batchProcessedCount(data), total: data.total_files })}
        </span>
      </div>

      <ProgressBar progress={batchProgressPercent(data)} isActive={isProcessing} />

      <div className={detailCounts()}>
        <span>{t("dropImport.detail.imported", { count: data.imported_files })}</span>
        <span>{t("dropImport.detail.alreadyInLibrary", { count: data.already_in_library_files })}</span>
        <span>{t("dropImport.detail.pending", { count: data.pending_files })}</span>
        <span>{t("dropImport.detail.failed", { count: data.failed_files })}</span>
        <span>{t("dropImport.detail.discarded", { count: data.discarded_files })}</span>
      </div>

      <RejectedFilesList entries={rejected} />

      <div className={fileList()}>
        {data.files.map((file) => (
          <Fragment key={file.id}>
            <FileRow
              file={file}
              isMatchOpen={matchFileId === file.id}
              onToggleMatch={() => setMatchFileId((prev) => (prev === file.id ? null : file.id))}
            />
            {matchFileId === file.id && file.status === DropImportFileStatus.enum.pending_match ? (
              <MatchSearchPanel file={file} onClose={() => setMatchFileId(null)} />
            ) : null}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
