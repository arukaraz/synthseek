import { cva } from "class-variance-authority";

export const dialogBody = cva("flex max-h-[85dvh] w-full max-w-2xl flex-col gap-3 p-4 sm:p-6");

export const head = cva("flex min-w-0 flex-col gap-1.5 pr-8");

export const title = cva("text-fg min-w-0 truncate text-lg font-semibold");

export const sub = cva("text-fg/60 text-xs");

export const actions = cva("flex flex-wrap gap-2 pt-1");

export const tabsRow = cva("flex min-w-0");

export const rows = cva("flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto");

export const row = cva("flex min-w-0 items-center gap-2 rounded-lg px-1 py-1");

export const rowCover = cva("relative size-9 shrink-0 overflow-hidden rounded-md");

export const rowCopy = cva("flex min-w-0 flex-1 flex-col");

export const rowTitle = cva("text-fg min-w-0 truncate text-sm");

export const rowSub = cva("text-fg/60 min-w-0 truncate text-xs");

export const rowTime = cva("text-fg/60 shrink-0 font-mono text-[11px] tabular-nums");

export const rowActions = cva("flex shrink-0 items-center gap-0.5");

export const note = cva("border-primary-400 bg-fg/[0.03] text-fg/80 rounded-r-lg border-l-2 px-3 py-1.5 text-xs");

export const empty = cva("text-fg/60 py-3 text-sm");

export const sectionLabel = cva("text-fg/60 pt-2 font-mono text-[10.5px] tracking-wider uppercase");

export const stars = cva("hidden items-center sm:flex");

export const star = cva(
  "focus-visible:ring-primary-400 rounded p-0.5 outline-none focus-visible:ring-2 [&_svg]:size-3.5",
  {
    variants: {
      lit: {
        true: "text-primary-400 [&_svg]:fill-current",
        false: "text-fg/30 hover:text-fg/60",
      },
    },
    defaultVariants: { lit: false },
  }
);
