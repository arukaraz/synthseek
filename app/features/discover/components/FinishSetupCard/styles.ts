import { cva } from "class-variance-authority";

export const finishCard = cva(
  "border-primary-500/40 from-primary-500/15 to-primary-500/5 bg-linear-to-b flex flex-col gap-3 rounded-2xl border p-4 shadow-[0_0_50px_-20px_var(--color-primary-500)]"
);

export const finishHeader = cva("flex items-center justify-between gap-3");

export const finishTitle = cva("text-fg text-sm font-bold");

export const finishCounter = cva(
  "border-fg/15 text-fg-muted inline-flex items-center rounded-full border px-2.5 py-0.5 text-11 font-semibold whitespace-nowrap"
);

export const finishMeter = cva("bg-fg/10 h-1.5 overflow-hidden rounded-full");

export const finishMeterFill = cva(
  "from-primary-500 to-secondary-500 bg-linear-to-r block h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
);

export const finishList = cva("flex flex-col gap-2");

export const finishRow = cva(
  "border-fg/10 bg-fg/[0.03] hover:bg-fg/[0.07] focus-visible:ring-primary-500 flex min-h-11 items-center gap-2.5 rounded-xl border px-3 py-2 transition-colors outline-none focus-visible:ring-2 motion-reduce:transition-none"
);

export const finishMark = cva("border-fg/30 size-5 shrink-0 rounded-full border-[1.5px]");

export const finishRowLabel = cva("text-fg flex-1 text-13 font-semibold");

export const finishRowAction = cva("text-fg-muted text-12 font-medium");

export const finishFooter = cva("flex items-center justify-between gap-3");

export const finishHide = cva(
  "text-fg-muted hover:text-fg focus-visible:ring-primary-500 rounded text-13 underline underline-offset-4 outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
);
