"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@components/ui/Dialog";
import { EmptyState } from "@components/ui/EmptyState";
import { Pagination } from "@components/ui/Pagination";
import { SectionLoading } from "@components/ui/SectionLoading";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";
import {
  useKeepBestLibraryCopies,
  useKeepBestLibraryCopy,
  useKeepThisCopy,
} from "@hooks/api/mutations/jobs/useLibraryScanControls";
import { useDuplicateGroups } from "@hooks/api/queries/useLibraryScanStatus";
import { useClientPagination } from "@hooks/ui/useClientPagination";
import { formatBytes } from "@utils/formatters";

import {
  dupBanner,
  dupBannerFigure,
  dupBannerNote,
  dupBannerTitle,
  dupCard,
  dupCardHead,
  dupCaret,
  dupDir,
  dupFiles,
  dupReclaim,
  dupScroll,
  dupTab,
  dupTabCount,
  dupTabs,
  dupTrackMeta,
  dupTrackTitle,
} from "../../styles";
import { CopyRow } from "./CopyRow";
import { describeCopies } from "./helpers";
import type { DuplicatesDialogProps } from "./types";

export function DuplicatesDialog({ isOpen, onClose, reclaiming }: DuplicatesDialogProps) {
  const { t } = useTranslation("settings");
  const groups = useDuplicateGroups(isOpen);
  const keepAll = useKeepBestLibraryCopies();
  const keepOne = useKeepBestLibraryCopy();
  const keepThis = useKeepThisCopy();
  const [prefersSafe, setPrefersSafe] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);

  const all = groups.data?.groups ?? [];
  const safe = all.filter((group) => !group.ambiguous);
  const review = all.filter((group) => group.ambiguous);
  const safeTab = safe.length > 0 && (prefersSafe || review.length === 0);
  const rows = safeTab ? safe : review;
  const pager = useClientPagination(rows);
  const busy = reclaiming || keepAll.isPending;

  const wasReclaiming = useRef(reclaiming);
  useEffect(() => {
    if (wasReclaiming.current && !reclaiming) void groups.refetch();
    wasReclaiming.current = reclaiming;
  }, [reclaiming, groups]);

  const settled = groups.isSuccess && all.length === 0;
  useEffect(() => {
    if (isOpen && settled) onClose();
  }, [isOpen, settled, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(next) => (next ? undefined : onClose())}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t("libraryScan.duplicates.title")}</DialogTitle>
          <DialogDescription>{t("libraryScan.duplicates.description", { count: all.length })}</DialogDescription>
        </DialogHeader>

        {groups.isLoading ? (
          <SectionLoading />
        ) : all.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title={t("libraryScan.duplicates.emptyTitle")}
            description={t("libraryScan.duplicates.emptyBody")}
          />
        ) : (
          <div className="flex flex-col">
            <div role="tablist" className={dupTabs()}>
              {[
                { safe: true, label: t("libraryScan.duplicates.tabSafe"), count: safe.length },
                { safe: false, label: t("libraryScan.duplicates.tabReview"), count: review.length },
              ].map((tab) => (
                <button
                  key={tab.label}
                  type="button"
                  role="tab"
                  aria-selected={safeTab === tab.safe}
                  className={dupTab({ active: safeTab === tab.safe })}
                  onClick={() => {
                    setPrefersSafe(tab.safe);
                    pager.onPageChange(1);
                  }}
                >
                  {tab.label}
                  <span className={dupTabCount()}>{tab.count}</span>
                </button>
              ))}
            </div>

            <div className="pt-4">
              {safeTab ? (
                <div className={dupBanner({ tone: "safe" })}>
                  <div className="flex min-w-45 flex-1 flex-col gap-0.5">
                    <span className={dupBannerFigure()}>
                      {t("libraryScan.duplicates.reclaimable", { size: formatBytes(groups.data?.safeBytes ?? 0) })}
                    </span>
                    <span className={dupBannerNote()}>
                      {t("libraryScan.duplicates.safeNote", { count: safe.length })}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => keepAll.mutate()}
                    disabled={busy || safe.length === 0}
                    aria-busy={busy}
                  >
                    {busy ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    {busy
                      ? t("libraryScan.duplicates.tidyAllRunning")
                      : t("libraryScan.duplicates.tidyAll", { count: safe.length })}
                  </Button>
                </div>
              ) : (
                <div className={dupBanner({ tone: "review" })}>
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className={dupBannerTitle()}>
                      {t("libraryScan.duplicates.reviewTitle", { count: review.length })}
                    </span>
                    <span className={dupBannerNote()}>{t("libraryScan.duplicates.reviewNote")}</span>
                  </div>
                </div>
              )}
            </div>

            <div className={dupScroll()}>
              {pager.visible.map((group) => {
                const open = expanded[group.requestId] === true;
                return (
                  <div key={group.requestId} className={dupCard()}>
                    <div className={dupCardHead()}>
                      <button
                        type="button"
                        className={dupCaret()}
                        aria-expanded={open}
                        aria-label={t("libraryScan.duplicates.showCopies")}
                        onClick={() => setExpanded((prev) => ({ ...prev, [group.requestId]: !open }))}
                      >
                        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                      </button>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className={dupTrackTitle()}>
                          {group.artist} - {group.title}
                        </span>
                        <span className={dupTrackMeta()}>{describeCopies(group, t)}</span>
                      </div>
                      <span className={dupReclaim()}>{formatBytes(group.reclaimableBytes)}</span>
                      {group.ambiguous ? (
                        <TooltipProvider delayDuration={150}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span tabIndex={0} className="shrink-0">
                                <Button size="sm" variant="outline" disabled>
                                  {t("libraryScan.duplicates.tidyOne")}
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-64">
                              {t(`libraryScan.duplicates.reason.${group.reason ?? "titles_differ"}`)}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => keepOne.mutate({ requestId: group.requestId })}
                          disabled={busy || keepOne.isPending}
                        >
                          {t("libraryScan.duplicates.tidyOne")}
                        </Button>
                      )}
                    </div>

                    {open ? (
                      <div className={dupFiles()}>
                        {group.directory.length > 0 ? <span className={dupDir()}>{group.directory}</span> : null}
                        {group.copies.map((copy) => (
                          <CopyRow
                            key={copy.id}
                            copy={copy}
                            disabled={busy}
                            keeping={keepThis.isPending}
                            playing={playingId === copy.id}
                            onPlayChange={setPlayingId}
                            onKeep={() => keepThis.mutate({ fileId: copy.id })}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
