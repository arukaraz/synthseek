"use client";

import { SectionLoading } from "@components/ui/SectionLoading";
import { DataTable, cycleSortDirection } from "@components/ui/Table";
import { useCancelTrack, useRetryTrack, useTrackRequests } from "@hooks/api";
import { useDebounce } from "@hooks/ui/useDebounce";
import { useUrlParams } from "@hooks/ui/useUrlParam";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { isOwnerOrAdminFE } from "@utils/authorization";
import { confirm } from "@utils/confirm";
import { useCallback, useMemo, useState } from "react";
import { RequestsEmptyState } from "../components/RequestsEmptyState";
import { buildFlatTrackColumns } from "../components/Table/columns";
import { flattenRequestsToTrackRows, searchFlatTrackRows, sortFlatTrackRows } from "../components/Table/helpers";
import { filterRequestsByStatus } from "../helpers";
import { FlatTrackRow, REQUESTS_URL_PARAMS, TableSortConfig, TableSortField } from "../types";

export function ListView() {
  const { data: items, isLoading } = useTrackRequests();
  const { values } = useUrlParams({
    filter: REQUESTS_URL_PARAMS.filter,
    q: REQUESTS_URL_PARAMS.q,
  });
  const searchQuery = useDebounce(values.q, { delay: 300 });
  const statusFilter = values.filter;

  const [sort, setSort] = useState<TableSortConfig>({ field: "created_at", direction: "desc" });

  const { currentUser } = useAuthContext();
  const retryTrack = useRetryTrack();
  const cancelTrack = useCancelTrack();

  const handleCancel = useCallback(
    async (item: FlatTrackRow) => {
      const confirmed = await confirm({
        title: "Cancel Track",
        message: `Cancel "${item.title}" by ${item.artist}?`,
        variant: "danger",
        confirmText: "Cancel",
        cancelText: "Keep",
      });
      if (confirmed) cancelTrack.mutate({ trackId: item.id });
    },
    [cancelTrack]
  );

  const rows = useMemo<FlatTrackRow[]>(() => {
    const filteredItems = filterRequestsByStatus(items, statusFilter);
    const flat = flattenRequestsToTrackRows(filteredItems);
    const searched = searchFlatTrackRows(flat, searchQuery);
    return sortFlatTrackRows(searched, sort);
  }, [items, sort, searchQuery, statusFilter]);

  const columns = useMemo(
    () =>
      buildFlatTrackColumns({
        currentUserId: currentUser?.id,
        canActFor: (item) => isOwnerOrAdminFE({ id: item.parent.requestedBy.id }, currentUser),
        onRetry: (item) => retryTrack.mutate({ trackId: item.id }),
        onCancel: handleCancel,
      }),
    [currentUser, retryTrack, handleCancel]
  );

  const handleSort = (field: string) => {
    const next = cycleSortDirection(sort, field);
    setSort({ field: next.field as TableSortField, direction: next.direction });
  };

  if (isLoading) {
    return <SectionLoading message="Loading requests..." />;
  }

  if (rows.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <RequestsEmptyState searchQuery={searchQuery} />
      </div>
    );
  }

  return (
    <div className="p-4">
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(item) => `${item.parent.id}:${item.id}`}
        sortState={sort}
        onSort={handleSort}
        minWidth="600px"
        rowAttrs={(item) => ({ "data-status": item.status })}
      />
    </div>
  );
}
