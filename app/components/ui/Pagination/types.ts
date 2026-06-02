export interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

export type PageRangeItem = number | "ellipsis";
