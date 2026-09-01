"use client";

import { useMemo, useState } from "react";

import { CLIENT_PAGINATION } from "./constants";
import type { ClientPagination } from "./types";

const NOTHING: readonly never[] = Object.freeze([]);

export function useClientPagination<T>(
  source: readonly T[] | undefined,
  options: { pageSize?: number; threshold?: number } = {}
): ClientPagination<T> {
  const items = source ?? NOTHING;
  const pageSizeDefault = options.pageSize ?? CLIENT_PAGINATION.PAGE_SIZE;
  const threshold = options.threshold ?? CLIENT_PAGINATION.THRESHOLD;
  const [pageSize, setPageSize] = useState(pageSizeDefault);
  const [requestedPage, setRequestedPage] = useState(1);

  const paginated = items.length >= threshold;
  const pageCount = paginated ? Math.max(1, Math.ceil(items.length / pageSize)) : 1;
  const page = Math.min(Math.max(1, requestedPage), pageCount);

  const visible = useMemo(
    () => (paginated ? items.slice((page - 1) * pageSize, page * pageSize) : [...items]),
    [items, paginated, page, pageSize]
  );

  return {
    visible,
    paginated,
    page,
    pageCount,
    pageSize,
    totalItems: items.length,
    pageSizeOptions: CLIENT_PAGINATION.SIZE_OPTIONS,
    onPageChange: setRequestedPage,
    onPageSizeChange: (size: number) => {
      setPageSize(size);
      setRequestedPage(1);
    },
  };
}
