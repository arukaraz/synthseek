"use client";

import { RequestStatus } from "@api/__generated__/types";
import { Pagination } from "@components/ui/Pagination";
import { SectionLoading } from "@components/ui/SectionLoading";
import { DataTable, cycleSortDirection } from "@components/ui/Table";
import { useCancelTrack, usePrioritizeTrack, useRetryTrack, useTrackRequests } from "@hooks/api";
import { useDebounce } from "@hooks/ui/useDebounce";
import { useUrlParam, useUrlParams } from "@hooks/ui/useUrlParam";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { isOwnerOrAdminFE } from "@utils/authorization";
import { confirm } from "@utils/confirm";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActiveSourceChips } from "./ActiveSourceChips";
import { RequestsEmptyState } from "./RequestsEmptyState";
import { buildFlatTrackColumns } from "./Table/columns";
import { flattenRequestsToTrackRows, searchFlatTrackRows, sortFlatTrackRows } from "./Table/helpers";
import {
  filterRequestsByStatus,
  parsePage,
  parsePerPage,
  parseSourceIds,
  serializeSourceIds,
  toggleSourceId,
} from "../helpers";
import { FlatTrackRow, PER_PAGE_OPTIONS, REQUESTS_URL_PARAMS, TableSortConfig, TableSortField } from "../types";

export function ListViewMode() {
  const { t } = useTranslation("requests");
  const { data: items, isLoading } = useTrackRequests();
  const { values } = useUrlParams({
    filter: REQUESTS_URL_PARAMS.filter,
    q: REQUESTS_URL_PARAMS.q,
  });
  const [sourceRaw, setSource] = useUrlParam("source", REQUESTS_URL_PARAMS.source);
  const [pageRaw, setPage] = useUrlParam("page", REQUESTS_URL_PARAMS.page);
  const [perPageRaw, setPerPage] = useUrlParam("perPage", REQUESTS_URL_PARAMS.perPage);
  const searchQuery = useDebounce(values.q, { delay: 300 });
  const statusFilter = values.filter;
  const perPage = parsePerPage(perPageRaw);

  const [sort, setSort] = useState<TableSortConfig>({ field: "created_at", direction: "desc" });

  const { currentUser } = useAuthContext();
  const retryTrack = useRetryTrack();
  const cancelTrack = useCancelTrack();
  const prioritizeTrack = usePrioritizeTrack();

  const handleCancel = useCallback(
    async (item: FlatTrackRow) => {
      const confirmed = await confirm({
        title: t("confirm.cancelTrackTitle"),
        message: t("confirm.cancelTrackMessage", { title: item.title, artist: item.artist }),
        variant: "danger",
        confirmText: t("confirm.cancelConfirm"),
        cancelText: t("confirm.cancelKeep"),
      });
      if (confirmed) cancelTrack.mutate({ trackId: item.id });
    },
    [cancelTrack, t]
  );

  const handleSelectSource = useCallback(
    (parentId: string) => setSource(serializeSourceIds(toggleSourceId(parseSourceIds(sourceRaw), parentId))),
    [setSource, sourceRaw]
  );

  const rows = useMemo<FlatTrackRow[]>(() => {
    const filteredItems = filterRequestsByStatus(items, statusFilter);
    const flat = flattenRequestsToTrackRows(filteredItems);
    const selectedIds = new Set(parseSourceIds(sourceRaw));
    const bySource = selectedIds.size > 0 ? flat.filter((row) => selectedIds.has(row.parent.id)) : flat;
    const searched = searchFlatTrackRows(bySource, searchQuery);
    return sortFlatTrackRows(searched, sort);
  }, [items, sort, searchQuery, statusFilter, sourceRaw]);

  const pageCount = Math.max(1, Math.ceil(rows.length / perPage));
  const currentPage = Math.min(Math.max(1, parsePage(pageRaw)), pageCount);
  const pageRows = useMemo(
    () => rows.slice((currentPage - 1) * perPage, currentPage * perPage),
    [rows, currentPage, perPage]
  );

  useEffect(() => {
    if (parsePage(pageRaw) !== currentPage) setPage(currentPage === 1 ? null : String(currentPage));
  }, [pageRaw, currentPage, setPage]);

  const prevFilterKey = useRef<string | null>(null);
  useEffect(() => {
    const key = `${statusFilter}|${sourceRaw}|${searchQuery}|${perPage}`;
    if (prevFilterKey.current !== null && prevFilterKey.current !== key) setPage(null);
    prevFilterKey.current = key;
  }, [statusFilter, sourceRaw, searchQuery, perPage, setPage]);

  const handlePageChange = (next: number) => setPage(next <= 1 ? null : String(next));
  const handlePageSizeChange = (size: number) => setPerPage(String(size));

  const columns = useMemo(
    () =>
      buildFlatTrackColumns({
        currentUserId: currentUser?.id,
        canActFor: (item) =>
          item.parent.status !== RequestStatus.enum.delegated &&
          isOwnerOrAdminFE({ id: item.parent.requestedBy.id }, currentUser),
        onRetry: (item) => retryTrack.mutate({ trackId: item.id }),
        onCancel: handleCancel,
        onPrioritize: (item) => prioritizeTrack.mutate({ trackId: item.id }),
        onSelectSource: handleSelectSource,
      }),
    [currentUser, retryTrack, prioritizeTrack, handleCancel, handleSelectSource]
  );

  const handleSort = (field: string) => {
    const next = cycleSortDirection(sort, field);
    setSort({ field: next.field as TableSortField, direction: next.direction });
  };

  if (isLoading) {
    return <SectionLoading message={t("loading.requests")} />;
  }

  return (
    <div className="p-4">
      <ActiveSourceChips />
      {rows.length === 0 ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <RequestsEmptyState searchQuery={searchQuery} />
        </div>
      ) : (
        <>
          <DataTable
            data={pageRows}
            columns={columns}
            getRowId={(item) => `${item.parent.id}:${item.id}`}
            sortState={sort}
            onSort={handleSort}
            minWidth="600px"
            rowAttrs={(item) => ({ "data-status": item.status })}
          />
          <Pagination
            page={currentPage}
            pageCount={pageCount}
            pageSize={perPage}
            totalItems={rows.length}
            pageSizeOptions={PER_PAGE_OPTIONS}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  );
}
