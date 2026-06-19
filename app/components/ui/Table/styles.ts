import { cva, type VariantProps } from "class-variance-authority";

export const tableContainer = cva(
  "border-fg/10 bg-surface/30 min-w-0 overflow-hidden rounded-xl border sm:bg-surface/20 sm:backdrop-blur-sm",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type TableContainerProps = VariantProps<typeof tableContainer>;

export const tableScroll = cva("overflow-x-auto", {
  variants: {},
  defaultVariants: {},
});

export type TableScrollProps = VariantProps<typeof tableScroll>;

export const table = cva("w-full caption-bottom text-sm", {
  variants: {
    layout: {
      auto: "table-auto",
      fixed: "table-fixed",
    },
  },
  defaultVariants: {
    layout: "auto",
  },
});

export type TableProps = VariantProps<typeof table>;

export const tableHeader = cva("bg-surface/40 [&_tr]:border-b", {
  variants: {},
  defaultVariants: {},
});

export type TableHeaderStyleProps = VariantProps<typeof tableHeader>;

export const tableHeaderRow = cva("border-fg/10 hover:bg-transparent", {
  variants: {},
  defaultVariants: {},
});

export type TableHeaderRowProps = VariantProps<typeof tableHeaderRow>;

export const tableHead = cva(
  "text-fg/40 px-3 py-2 text-left text-xs font-medium tracking-wider uppercase sm:px-4 sm:py-3",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type TableHeadStyleProps = VariantProps<typeof tableHead>;

export const tableHeadSortable = cva("flex items-center gap-1.5 transition-colors", {
  variants: {
    active: {
      true: "text-fg",
      false: "text-fg/80 hover:text-fg/90",
    },
  },
  defaultVariants: {
    active: false,
  },
});

export type TableHeadSortableProps = VariantProps<typeof tableHeadSortable>;

export const tableBody = cva("[&_tr:last-child]:border-0", {
  variants: {},
  defaultVariants: {},
});

export type TableBodyStyleProps = VariantProps<typeof tableBody>;

export const tableRow = cva("group border-fg/5 hover:bg-fg/5 border-b transition-colors last:border-b-0", {
  variants: {
    clickable: {
      true: "cursor-pointer",
      false: "",
    },
  },
  defaultVariants: {
    clickable: false,
  },
});

export type TableRowStyleProps = VariantProps<typeof tableRow>;

export const tableCell = cva("text-fg/70 px-3 py-2 align-middle sm:px-4 sm:py-3", {
  variants: {},
  defaultVariants: {},
});

export type TableCellStyleProps = VariantProps<typeof tableCell>;

export const tableEmptyCell = cva("text-fg/50 px-4 py-12 text-center", {
  variants: {},
  defaultVariants: {},
});

export type TableEmptyCellProps = VariantProps<typeof tableEmptyCell>;
