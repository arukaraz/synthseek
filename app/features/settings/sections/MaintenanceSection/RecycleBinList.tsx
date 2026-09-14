"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Search, Undo2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Pagination } from "@components/ui/Pagination";
import { SectionLoading } from "@components/ui/SectionLoading";
import { useRestoreRecycledFile } from "@hooks/api/mutations/settings/useRecycleBin";
import { useRecycleBinEntries } from "@hooks/api/queries/useRecycleBin";
import { useClientPagination } from "@hooks/ui/useClientPagination";
import { formatBytes } from "@utils/formatters";

import { binDir, binFileName, binRestore, binRow, binRowMeta, binToggle } from "../../styles";
import { matchingRecycled } from "./helpers";
import { binNoMatches, binSearch, binSearchBox, quarantineListHeader } from "./styles";
import type { RecycleBinListProps } from "./types";

export function RecycleBinList({ entryCount }: RecycleBinListProps) {
  const { t } = useTranslation("settings");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const entries = useRecycleBinEntries(open);
  const restore = useRestoreRecycledFile();
  const matching = matchingRecycled(entries.data, search);
  const pager = useClientPagination(matching);

  if (entryCount === 0) return null;

  return (
    <>
      <div className={quarantineListHeader()}>
        <button
          type="button"
          className={binToggle()}
          aria-expanded={open}
          onClick={() => {
            setOpen(!open);
            setSearch("");
          }}
        >
          {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          {t("quality.recycleBin.list.toggle", { count: entryCount })}
        </button>
      </div>

      {open ? (
        entries.isLoading ? (
          <SectionLoading />
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className={binSearchBox()}>
              <Search className="text-fg/40 absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("quality.recycleBin.list.searchPlaceholder")}
                aria-label={t("quality.recycleBin.list.searchPlaceholder")}
                className={binSearch()}
              />
            </div>

            {pager.totalItems === 0 ? (
              <span className={binNoMatches()}>{t("quality.recycleBin.list.noMatches")}</span>
            ) : null}

            {pager.visible.map((entry) => (
              <div key={entry.id} className={binRow()}>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className={binFileName()}>{entry.fileName}</span>
                  <span className={binDir()}>{entry.relativePath.slice(0, -entry.fileName.length)}</span>
                  <span className={binRowMeta()}>
                    {formatBytes(entry.sizeBytes)} · {entry.recycledOn}
                  </span>
                </div>
                <button
                  type="button"
                  className={binRestore()}
                  disabled={restore.isPending}
                  onClick={() => restore.mutate({ id: entry.id })}
                >
                  {restore.isPending ? <Loader2 className="size-3 animate-spin" /> : <Undo2 className="size-3" />}
                  {t("quality.recycleBin.list.restore")}
                </button>
              </div>
            ))}
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
        )
      ) : null}
    </>
  );
}
