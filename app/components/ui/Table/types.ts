import { ReactNode } from "react";

export interface ColumnDef<TData> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;

  cell?: (item: TData) => ReactNode;

  accessor?: (item: TData) => string | number | null;

  header?: () => ReactNode;
}

export interface SortState {
  column: string | null;
  direction: "asc" | "desc" | null;
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  getRowId: (item: TData) => string;

  sortable?: boolean;
  sortState?: SortState;
  onSort?: (column: string) => void;

  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectRow?: (id: string) => void;
  onSelectAll?: () => void;

  onRowClick?: (item: TData) => void;
  isRowClickable?: (item: TData) => boolean;

  className?: string;
  emptyMessage?: string;
}

export interface TableHeaderProps<TData> {
  columns: ColumnDef<TData>[];
  selectable?: boolean;
  sortable?: boolean;
  sortState?: SortState;
  onSort?: (column: string) => void;
  allSelected?: boolean;
  someSelected?: boolean;
  onSelectAll?: () => void;
}

export interface TableBodyProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  getRowId: (item: TData) => string;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectRow?: (id: string) => void;
  onRowClick?: (item: TData) => void;
  isRowClickable?: (item: TData) => boolean;
  emptyMessage?: string;
}

export interface TableHeaderCellProps<TData> {
  column: ColumnDef<TData>;
  sortable?: boolean;
  isActive?: boolean;
  direction?: "asc" | "desc" | null;
  onSort?: (column: string) => void;
}

export interface TableDataRowProps<TData> {
  item: TData;
  columns: ColumnDef<TData>[];
  selectable?: boolean;
  isSelected?: boolean;
  clickable?: boolean;
  onSelect?: () => void;
  onClick?: () => void;
}
