"use client";

import { useState } from "react";

import { ChevronRight, Loader2, Sparkles, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@components/ui/Dialog";
import { EmptyState } from "@components/ui/EmptyState";
import { Pagination } from "@components/ui/Pagination";
import { SectionLoading } from "@components/ui/SectionLoading";
import {
  useDiscardLibraryCopy,
  useKeepBestLibraryCopies,
  useKeepBestLibraryCopy,
} from "@hooks/api/mutations/jobs/useLibraryScanControls";
import { useDuplicateGroups } from "@hooks/api/queries/useLibraryScanStatus";
import { useClientPagination } from "@hooks/ui/useClientPagination";
import { formatBytes } from "@utils/formatters";

import { scanCopyDiscard, scanDupCopies, scanDupMeta, scanDupRow, scanDupTitle } from "../../styles";
import type { DuplicatesDialogProps } from "./types";

export function DuplicatesDialog({ isOpen, onClose, reclaiming }: DuplicatesDialogProps) {
  const { t } = useTranslation("settings");
  const groups = useDuplicateGroups(isOpen);
  const keepAll = useKeepBestLibraryCopies();
  const keepOne = useKeepBestLibraryCopy();
  const discard = useDiscardLibraryCopy();
  const [pendingDiscard, setPendingDiscard] = useState<{ id: string; path: string; keep: string } | null>(null);
  const rows = groups.data?.groups ?? [];
  const pager = useClientPagination(rows);

  return (
    <Dialog open={isOpen} onOpenChange={(next) => (next ? undefined : onClose())}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("libraryScan.duplicates.title")}</DialogTitle>
          <DialogDescription>{t("libraryScan.duplicates.description")}</DialogDescription>
        </DialogHeader>
        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={scanDupMeta()}>
              {t("libraryScan.duplicates.summary", {
                count: rows.length,
                size: formatBytes(groups.data?.totalBytes ?? 0),
              })}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => keepAll.mutate()}
              disabled={reclaiming || keepAll.isPending || rows.length === 0}
              aria-busy={reclaiming || keepAll.isPending}
            >
              {reclaiming || keepAll.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {reclaiming || keepAll.isPending
                ? t("libraryScan.duplicates.tidyAllRunning")
                : t("libraryScan.duplicates.tidyAll")}
            </Button>
          </div>

          {groups.isLoading ? (
            <SectionLoading />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title={t("libraryScan.duplicates.emptyTitle")}
              description={t("libraryScan.duplicates.emptyBody")}
            />
          ) : (
            <>
              <div className="flex flex-col">
                {pager.visible.map((group) => (
                  <div key={group.requestId} className={scanDupRow()}>
                    <div className="min-w-0">
                      <p className={scanDupTitle()}>
                        {group.artist} - {group.title}
                      </p>
                      <p className={scanDupMeta()}>
                        {t("libraryScan.duplicates.copies", { count: group.copies.length })}
                        {" · "}
                        {t("libraryScan.duplicates.frees", { size: formatBytes(group.reclaimableBytes) })}
                        {group.ambiguous ? ` · ${t("libraryScan.duplicates.ambiguous")}` : ""}
                      </p>
                      <div className={scanDupCopies()}>
                        {group.copies.map((copy) => (
                          <span key={copy.id} className="flex items-center gap-1.5">
                            {copy.serving ? <ChevronRight className="size-3 shrink-0" /> : null}
                            {copy.fileFormat.toUpperCase()} {formatBytes(copy.sizeBytes)} · {copy.relativePath}
                            {!copy.serving && group.ambiguous ? (
                              <button
                                type="button"
                                className={scanCopyDiscard()}
                                onClick={() =>
                                  setPendingDiscard({
                                    id: copy.id,
                                    path: copy.relativePath,
                                    keep: group.copies.find((other) => other.serving)?.relativePath ?? "",
                                  })
                                }
                                disabled={discard.isPending || reclaiming}
                                aria-label={t("libraryScan.duplicates.discard")}
                              >
                                <Trash2 className="size-3" />
                              </button>
                            ) : null}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => keepOne.mutate({ requestId: group.requestId })}
                      disabled={group.ambiguous || reclaiming || keepOne.isPending}
                      title={group.ambiguous ? t("libraryScan.duplicates.ambiguousHint") : undefined}
                    >
                      {t("libraryScan.duplicates.tidyOne")}
                    </Button>
                  </div>
                ))}
              </div>

              {pager.paginated ? (
                <Pagination
                  page={pager.page}
                  pageCount={pager.pageCount}
                  pageSize={pager.pageSize}
                  totalItems={pager.totalItems}
                  pageSizeOptions={pager.pageSizeOptions}
                  onPageChange={pager.onPageChange}
                  onPageSizeChange={pager.onPageSizeChange}
                />
              ) : null}
            </>
          )}
        </div>

        <ConfirmationModal
          isOpen={pendingDiscard !== null}
          onClose={() => setPendingDiscard(null)}
          onConfirm={() => {
            if (pendingDiscard) discard.mutate({ fileId: pendingDiscard.id });
            setPendingDiscard(null);
          }}
          title={t("libraryScan.duplicates.confirmTitle")}
          message={t("libraryScan.duplicates.confirmBody", {
            path: pendingDiscard?.path ?? "",
            keep: pendingDiscard?.keep ?? "",
          })}
          confirmText={t("libraryScan.duplicates.discard")}
          variant="danger"
        />
      </DialogContent>
    </Dialog>
  );
}
