"use client";

import { ArrowRight, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/Dialog";
import { Notice } from "@components/ui/Notice";
import { Pagination } from "@components/ui/Pagination";
import { SegmentTabs } from "@components/ui/SegmentTabs";
import { useSaveAndOrganise } from "@hooks/api/mutations/library/useLibraryNaming";
import { useLibraryNamingMoves } from "@hooks/api/queries/useLibraryNaming";
import { useDebounce } from "@hooks/ui/useDebounce";

import { PAGE_SIZES, PREVIEW_DEBOUNCE_MS, PREVIEW_PAGE_SIZE } from "./constants";
import { classesFor, countFrom } from "./helpers";
import {
  previewFrom,
  previewRow,
  previewSearch,
  previewSearchBox,
  previewTable,
  previewTemplate,
  previewTo,
  previewToolbar,
} from "./styles";
import type { MoveFilter, PreviewModalProps } from "./types";

export function PreviewModal({ open, onOpenChange, template }: PreviewModalProps) {
  const { t } = useTranslation("settings");
  const [filter, setFilter] = useState<MoveFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PREVIEW_PAGE_SIZE);
  const [confirming, setConfirming] = useState(false);
  const debounced = useDebounce(search, { delay: PREVIEW_DEBOUNCE_MS });
  const apply = useSaveAndOrganise();

  const moves = useLibraryNamingMoves(
    { template, classes: classesFor(filter), search: debounced, page, pageSize },
    open && template.length > 0
  );

  useEffect(() => {
    setPage(1);
  }, [filter, debounced, pageSize]);

  useEffect(() => {
    if (!open) {
      setFilter("all");
      setSearch("");
      setPage(1);
      setConfirming(false);
    }
  }, [open]);

  const data = moves.data?.outcome === "valid" ? moves.data : null;
  const matched = data?.matched ?? 0;
  const relocating = countFrom(data?.byClass, "relocate");
  const renaming = countFrom(data?.byClass, "rename");
  const chosen = filter === "all" ? relocating + renaming : filter === "relocate" ? relocating : renaming;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("libraryNaming.preview.title")}</DialogTitle>
          </DialogHeader>

          <p className={previewTemplate()}>{template}</p>

          <div className={previewToolbar()}>
            <SegmentTabs
              items={[
                { value: "all", label: t("libraryNaming.preview.tabs.all"), count: relocating + renaming },
                { value: "relocate", label: t("libraryNaming.preview.tabs.relocate"), count: relocating },
                { value: "rename", label: t("libraryNaming.preview.tabs.rename"), count: renaming },
              ]}
              value={filter}
              onValueChange={setFilter}
              layoutId="library-preview-filter"
              ariaLabel={t("libraryNaming.preview.tabs.ariaLabel")}
            />
            <div className={previewSearchBox()}>
              <Search className="text-fg/40 absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("libraryNaming.preview.searchPlaceholder")}
                aria-label={t("libraryNaming.preview.searchPlaceholder")}
                className={previewSearch()}
              />
            </div>
          </div>

          {filter === "rename" && renaming > 0 ? (
            <Notice variant="warning" title={t("libraryNaming.preview.renameWarning")} />
          ) : null}

          {moves.isError ? <Notice variant="danger" title={t("libraryNaming.preview.loadFailed")} /> : null}

          <div className={previewTable()}>
            {moves.isFetching && data === null ? (
              <span className="text-fg/60 p-4 text-sm">{t("libraryNaming.preview.loading")}</span>
            ) : matched === 0 ? (
              <span className="text-fg/60 p-4 text-sm">{t("libraryNaming.preview.noMatches")}</span>
            ) : (
              data?.items.map((row) => (
                <div key={row.from} className={previewRow()}>
                  <span className={previewFrom()} title={row.from}>
                    {row.from}
                  </span>
                  <ArrowRight className="text-fg/30 size-3.5 shrink-0" />
                  <span className={previewTo()} title={row.to}>
                    {row.to}
                  </span>
                </div>
              ))
            )}
          </div>

          {matched > pageSize ? (
            <Pagination
              page={page}
              pageCount={Math.ceil(matched / pageSize)}
              pageSize={pageSize}
              totalItems={matched}
              pageSizeOptions={PAGE_SIZES}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          ) : null}

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={apply.isPending}>
              {t("libraryNaming.preview.cancel")}
            </Button>
            <Button onClick={() => setConfirming(true)} disabled={chosen === 0 || apply.isPending}>
              {apply.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {t("libraryNaming.preview.confirm", { count: chosen })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          apply.mutate(
            { template, classes: classesFor(filter) },
            { onSuccess: (result) => result.outcome === "started" && onOpenChange(false) }
          );
        }}
        title={t("libraryNaming.preview.confirmTitle")}
        message={t("libraryNaming.preview.confirmMessage", { count: chosen })}
        confirmText={t("libraryNaming.preview.confirmYes")}
        variant="warning"
      />
    </>
  );
}
