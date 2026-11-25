import { cva } from "class-variance-authority";

export const filterSortTriggerDefault = cva(
  "inline-flex h-9 items-center gap-2 rounded-lg border border-fg/10 bg-fg/5 px-3 text-sm text-fg/70 transition-colors hover:bg-fg/10 hover:text-fg"
);

export const filterSortCount = cva("text-fg/40 font-mono text-10");

export const filterSortLabel = cva("flex min-w-0 flex-1 items-center gap-1");

export const filterSortStatus = cva("text-fg/50 ml-2 shrink-0 text-10 font-semibold tracking-wider uppercase");

export const filterSortFooter = cva("px-2 pt-1 pb-2");

export const filterSortColumnsContent = cva("w-[calc(100vw-2rem)] max-w-xs sm:w-auto sm:max-w-none");

export const filterSortColumns = cva("grid grid-cols-1 sm:auto-cols-[minmax(11rem,1fr)] sm:grid-flow-col");

export const filterSortColumn = cva(
  "border-fg/10 min-w-0 border-t pt-1 first:border-t-0 first:pt-0 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-1 sm:first:border-l-0 sm:first:pl-0"
);

export const filterSortOrderRow = cva("flex gap-1 px-2 pb-2", {
  variants: {
    spaced: {
      true: "mt-3",
      false: "",
    },
  },
  defaultVariants: { spaced: false },
});

export const filterSortOrderBtn = cva(
  "flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs transition-colors",
  {
    variants: {
      active: {
        true: "border-primary-500/40 bg-primary-500/15 text-primary-400",
        false: "border-fg/10 bg-fg/5 text-fg/60 hover:bg-fg/10 hover:text-fg",
      },
    },
    defaultVariants: { active: false },
  }
);
