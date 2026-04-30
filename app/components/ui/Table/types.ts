import type { ReactNode } from "react";

export interface ColumnDef<TData> {
  key: string;
  header: ReactNode | (() => ReactNode);
  cell: (item: TData) => ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface SortState {
  field: string;
  direction: "asc" | "desc";
}

export type RowAttrs = Record<string, string | number | boolean | undefined>;

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  getRowId: (item: TData) => string;
  sortState?: SortState;
  onSort?: (field: string) => void;
  containerClassName?: string;
  minWidth?: string;
  emptyMessage?: string;
  rowAttrs?: (item: TData) => RowAttrs;
  staggerDelay?: number;
  onRowClick?: (item: TData) => void;
  isRowClickable?: (item: TData) => boolean;
}

export interface TableHeaderProps<TData> {
  columns: ColumnDef<TData>[];
  sortState?: SortState;
  onSort?: (field: string) => void;
}

export interface TableHeaderCellProps<TData> {
  column: ColumnDef<TData>;
  isActive: boolean;
  direction: SortState["direction"] | null;
  onSort?: (field: string) => void;
}

export interface TableBodyProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  getRowId: (item: TData) => string;
  emptyMessage: string;
  rowAttrs?: (item: TData) => RowAttrs;
  staggerDelay: number;
  onRowClick?: (item: TData) => void;
  isRowClickable?: (item: TData) => boolean;
}

export interface TableRowProps<TData> {
  item: TData;
  columns: ColumnDef<TData>[];
  index: number;
  staggerDelay: number;
  attrs?: RowAttrs;
  clickable: boolean;
  onClick?: () => void;
}
