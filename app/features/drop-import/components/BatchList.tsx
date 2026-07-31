"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { DropImportBatchStatus } from "@api/__generated__/types";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { IconButton } from "@components/ui/IconButton";
import { Spinner } from "@components/ui/Spinner";
import { useDeleteDropImportBatch, useDropImportBatches } from "@hooks/api";
import { formatRelativeTime } from "@utils/formatters";

import { batchProcessedCount } from "../helpers";
import {
  batchList,
  batchRow,
  batchRowButton,
  batchRowInfo,
  batchRowMeta,
  batchRowTitle,
  errorText,
  mutedText,
  sectionHeader,
} from "../styles";
import type { BatchListProps } from "../types";
import { BatchStatusBadge } from "./BatchStatusBadge";

export function BatchList({ onOpenBatch }: BatchListProps) {
  const { t } = useTranslation("library");
  const batches = useDropImportBatches();
  const deleteBatch = useDeleteDropImportBatch();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (batches.isLoading) {
    return (
      <div className="flex justify-center py-3">
        <Spinner size="sm" />
      </div>
    );
  }

  if (batches.isError) {
    return <span className={errorText()}>{t("dropImport.batches.loadError")}</span>;
  }

  const rows = batches.data ?? [];

  return (
    <div className="flex flex-col gap-1.5">
      <span className={sectionHeader()}>{t("dropImport.batches.title")}</span>

      {rows.length === 0 ? (
        <span className={mutedText()}>{t("dropImport.batches.empty")}</span>
      ) : (
        <ul className={batchList()}>
          {rows.map((batch) => (
            <li key={batch.id} className={batchRow()}>
              <button
                type="button"
                className={batchRowButton()}
                onClick={() => onOpenBatch(batch.id)}
                aria-label={t("dropImport.batches.openAria", { count: batch.total_files })}
              >
                <BatchStatusBadge status={batch.status} />
                <div className={batchRowInfo()}>
                  <span className={batchRowTitle()}>{t("dropImport.batches.files", { count: batch.total_files })}</span>
                  <span className={batchRowMeta()}>
                    {t("dropImport.batches.summary", {
                      processed: batchProcessedCount(batch),
                      total: batch.total_files,
                      time: formatRelativeTime(new Date(batch.created_at)),
                    })}
                  </span>
                </div>
              </button>
              <IconButton
                icon={Trash2}
                size="sm"
                aria-label={t("dropImport.batches.delete")}
                onClick={() => setConfirmId(batch.id)}
                disabled={batch.status === DropImportBatchStatus.enum.processing || deleteBatch.isPending}
              />
            </li>
          ))}
        </ul>
      )}

      <ConfirmationModal
        isOpen={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) deleteBatch.mutate({ batchId: confirmId });
        }}
        title={t("dropImport.batches.confirmDelete.title")}
        message={t("dropImport.batches.confirmDelete.message")}
        confirmText={t("dropImport.batches.confirmDelete.confirm")}
        variant="danger"
      />
    </div>
  );
}
