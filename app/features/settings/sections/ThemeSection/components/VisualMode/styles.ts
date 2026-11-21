import { cva } from "class-variance-authority";

export const editorLayout = cva("grid items-start gap-3 md:grid-cols-[9.25rem_minmax(0,1fr)] md:gap-5");

export const sectionsScroller = cva("md:overflow-visible");

export const sectionsList = cva("flex gap-1 md:flex-col md:gap-0.5");

export const sectionButton = cva(
  "focus-visible:ring-primary-500/50 flex shrink-0 cursor-pointer items-center justify-between gap-1.5 rounded-lg px-2.5 py-1.5 text-sm whitespace-nowrap outline-none transition-colors focus-visible:ring-2",
  {
    variants: {
      active: {
        true: "bg-surface-overlay text-fg font-semibold",
        false: "text-fg/60 hover:bg-fg/5 hover:text-fg",
      },
    },
    defaultVariants: { active: false },
  }
);

export const changeDot = cva("bg-warning-vivid size-1.5 shrink-0 rounded-full");

export const controlsColumn = cva("flex min-w-0 flex-col");

export const controlsTop = cva("mb-2.5 flex flex-wrap items-center gap-2");

export const searchField = cva("min-w-32 flex-1");

export const linkButton = cva(
  "text-primary-400 hover:text-primary-500 focus-visible:ring-primary-500/50 inline-flex cursor-pointer items-center gap-1.5 rounded px-0.5 py-1 text-13 underline underline-offset-4 outline-none focus-visible:ring-2"
);

export const emptyText = cva("text-fg/60 py-4 text-sm");

export const rowList = cva("flex flex-col");

const rowBase = "border-fg/10 grid items-center gap-2.5 border-t py-2 first:border-t-0";

export const colorRow = cva(`${rowBase} grid-cols-[2.125rem_minmax(0,1fr)_auto_auto_1.375rem]`);

export const rangeRow = cva(`${rowBase} grid-cols-[minmax(0,1fr)_minmax(5.5rem,44%)_minmax(3.25rem,auto)_1.375rem]`);

export const fontRow = cva(`${rowBase} grid-cols-[minmax(0,1fr)_minmax(8rem,50%)_1.375rem]`);

export const swatch = cva(
  "border-fg/20 focus-within:ring-primary-500/60 relative block size-8.5 overflow-hidden rounded-lg border focus-within:ring-2"
);

export const swatchFill = cva("absolute inset-0");

export const swatchInput = cva("absolute inset-0 size-full cursor-pointer opacity-0");

export const meta = cva("flex min-w-0 flex-col");

export const metaName = cva("text-fg truncate text-sm font-semibold");

export const metaHint = cva("text-xs", {
  variants: {
    warn: {
      true: "text-warning-vivid",
      false: "text-fg/60 line-clamp-2",
    },
  },
  defaultVariants: { warn: false },
});

export const valueText = cva("text-fg/60 font-mono text-xs tabular-nums");

export const rangeValue = cva("text-fg/60 text-right font-mono text-xs tabular-nums");

export const rangeInput = cva("accent-primary-500 w-full cursor-pointer");

export const customNumber = cva("col-span-2 flex items-center justify-end gap-2");

export const customText = cva("bg-surface-overlay text-fg/60 rounded-full px-2 py-0.5 text-11 whitespace-nowrap");

export const contrastBadge = cva("rounded-full border px-1.5 py-0.5 text-11 whitespace-nowrap tabular-nums", {
  variants: {
    low: {
      true: "border-warning-vivid/55 text-warning-vivid",
      false: "border-fg/15 text-fg/60",
    },
  },
  defaultVariants: { low: false },
});

export const resetButton = cva(
  "focus-visible:ring-primary-500/50 grid size-5.5 cursor-pointer place-items-center rounded-full outline-none focus-visible:ring-2 disabled:invisible"
);

export const resetGlyph = cva("bg-warning-vivid size-2 rounded-full");

export const fontSelectCell = cva("min-w-0");

export const uploadSlot = cva(
  "border-fg/10 bg-surface-sunken mt-3 grid grid-cols-[5.25rem_minmax(0,1fr)] items-center gap-3 rounded-lg border p-2.5"
);

export const uploadThumb = cva("bg-surface text-fg grid h-16 place-items-center rounded-lg");

export const uploadActions = cva("mt-1.5 flex flex-wrap items-center gap-2");

export const fileButton = cva(
  "border-fg/15 bg-surface-overlay text-fg hover:bg-fg/10 focus-within:ring-primary-500/60 relative inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm focus-within:ring-2 has-disabled:cursor-not-allowed has-disabled:opacity-60"
);

export const fileInput = cva("absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed");

export const fontList = cva("mt-3 flex flex-col");

export const fontItem = cva("border-fg/10 flex items-center gap-2 border-t py-1.5 first:border-t-0");

export const fontName = cva("text-fg min-w-0 flex-1 truncate text-sm");

export const fontSize = cva("text-fg/60 text-xs tabular-nums");

export const fontLeftOut = cva("text-warning-vivid text-xs");

export const fontSpace = cva("text-fg/60 mt-2 text-xs");
