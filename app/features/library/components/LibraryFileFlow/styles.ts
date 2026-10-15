import { cva } from "class-variance-authority";

export const moveDialog = cva("sm:max-w-xl");

export const flowBody = cva("mt-5 flex min-w-0 flex-col gap-4");

export const flowFooter = cva("mt-5 gap-2");

export const pathField = cva("flex flex-col gap-2");

export const pathFieldLabel = cva("text-fg/70 text-xs font-semibold tracking-wide uppercase");

export const pathList = cva("grid gap-2 sm:grid-cols-2");

export const pathOption = cva(
  "focus-visible:ring-primary-400 relative flex min-w-0 flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      active: {
        true: "border-primary-500/60 bg-primary-500/10",
        false: "border-fg/10 bg-fg/[0.03] hover:bg-fg/[0.06]",
      },
    },
    defaultVariants: { active: false },
  }
);

export const pathOptionLabel = cva("text-fg max-w-full truncate pr-6 text-sm font-semibold");

export const pathOptionDetail = cva("text-fg/55 max-w-full truncate text-xs");

export const pathOptionCheck = cva("text-primary-400 absolute top-2.5 right-2.5 size-4", {
  variants: {
    active: {
      true: "opacity-100",
      false: "opacity-0",
    },
  },
  defaultVariants: { active: false },
});

export const previewWrap = cva("flex min-w-0 flex-col gap-3");

export const previewPending = cva("flex justify-center py-4");

export const statStrip = cva("border-fg/10 bg-fg/[0.03] flex flex-wrap gap-x-4 gap-y-1 rounded-lg border px-3 py-2");

export const statItem = cva("text-fg/80 text-sm tabular-nums");

export const previewNote = cva("text-fg/60 text-xs");

export const noticeList = cva("flex list-disc flex-col gap-1 pl-4");

export const sampleTable = cva("border-fg/10 flex min-w-0 flex-col overflow-hidden rounded-lg border text-xs");

export const sampleHead = cva(
  "text-fg/50 bg-fg/[0.03] grid grid-cols-[minmax(0,1fr)_1rem_minmax(0,1fr)] gap-2 px-3 py-1.5 font-semibold"
);

export const sampleRow = cva(
  "border-fg/10 grid grid-cols-[minmax(0,1fr)_1rem_minmax(0,1fr)] items-center gap-2 border-t px-3 py-1.5"
);

export const samplePath = cva("text-fg/70 truncate font-mono");

export const sampleArrow = cva("text-fg/40 size-3.5");

export const progressBody = cva("flex flex-col gap-2");

export const progressCount = cva("text-fg/70 text-sm tabular-nums");

export const failureList = cva("mt-1 flex flex-col gap-0.5");

export const failureMore = cva("opacity-70");
