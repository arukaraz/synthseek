"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, Loader2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { EmptyState } from "@components/ui/EmptyState";
import { Pagination } from "@components/ui/Pagination";
import { SectionLoading } from "@components/ui/SectionLoading";
import { useKeepThisCopy, useRejectCopies } from "@hooks/api/mutations/jobs/useLibraryScanControls";
import { useDuplicateGroups } from "@hooks/api/queries/useLibraryScanStatus";
import { useClientPagination } from "@hooks/ui/useClientPagination";
import { formatBytes } from "@utils/formatters";

import {
  dupCard,
  dupCardHead,
  dupCaret,
  dupComparing,
  dupListenPill,
  dupReclaim,
  dupScroll,
  dupTrackMeta,
  dupTrackTitle,
} from "../../styles";
import { DuplicateComparator } from "./DuplicateComparator";
import { describeCopies } from "./helpers";
import { RejectCopiesDialog } from "./RejectCopiesDialog";
import type { DuplicateGroup, DuplicatesContentProps } from "./types";

export function DuplicatesContent({ enabled, reclaiming }: DuplicatesContentProps) {
  const { t } = useTranslation("settings");
  const groups = useDuplicateGroups(enabled);
  const keepThis = useKeepThisCopy();
  const reject = useRejectCopies();
  const [openId, setOpenId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<DuplicateGroup | null>(null);

  const all = groups.data?.groups ?? [];
  const comparing = groups.data?.comparing ?? 0;
  const pager = useClientPagination(all);
  const busy = reclaiming || keepThis.isPending || reject.isPending;

  const wasReclaiming = useRef(reclaiming);
  useEffect(() => {
    if (wasReclaiming.current && !reclaiming) void groups.refetch();
    wasReclaiming.current = reclaiming;
  }, [reclaiming, groups]);

  const openNextAfter = (requestId: string) => {
    const next = all.find((group) => group.requestId !== requestId);
    setOpenId(next?.requestId ?? null);
  };

  if (groups.isLoading) return <SectionLoading />;

  return (
    <>
      {comparing > 0 ? (
        <div className={dupComparing()}>
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          {t("libraryScan.duplicates.comparing", { count: comparing })}
        </div>
      ) : null}
      {all.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={t("libraryScan.duplicates.emptyTitle")}
          description={t("libraryScan.duplicates.emptyBody")}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className={dupScroll()}>
            {pager.visible.map((group) => {
              const open = openId === group.requestId;
              return (
                <div key={group.requestId} className={dupCard()}>
                  <button
                    type="button"
                    className={dupCardHead()}
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : group.requestId)}
                  >
                    <ChevronRight className={dupCaret({ open })} aria-hidden />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className={dupTrackTitle()}>
                        {group.artist} - {group.title}
                      </span>
                      <span className={dupTrackMeta()}>{describeCopies(group, t)}</span>
                    </span>
                    <span className={dupListenPill()}>{t("libraryScan.duplicates.listen")}</span>
                    <span className={dupReclaim()}>{formatBytes(group.reclaimableBytes)}</span>
                  </button>
                  {open ? (
                    <DuplicateComparator
                      group={group}
                      busy={busy}
                      onKeep={(copy) =>
                        keepThis.mutate({ fileId: copy.id }, { onSuccess: () => openNextAfter(group.requestId) })
                      }
                      onNoneFits={() => setRejecting(group)}
                    />
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
      <RejectCopiesDialog
        group={rejecting}
        pending={reject.isPending}
        onCancel={() => setRejecting(null)}
        onConfirm={(searchAgain) => {
          if (rejecting === null) return;
          const requestId = rejecting.requestId;
          reject.mutate(
            { requestId, searchAgain },
            {
              onSuccess: () => {
                setRejecting(null);
                openNextAfter(requestId);
              },
            }
          );
        }}
      />
    </>
  );
}
