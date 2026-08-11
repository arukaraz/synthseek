import { cva, type VariantProps } from "class-variance-authority";

export const modalContent = cva(
  [
    "flex w-full flex-col p-4 sm:p-6",
    "h-[100dvh] max-w-none !max-h-[100dvh] !top-0 !left-0 !translate-x-0 !rounded-none",
    "sm:h-auto sm:max-w-xl sm:!max-h-[90vh] sm:!top-[50%] sm:!left-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] sm:!rounded-2xl",
  ].join(" ")
);

export const modalBody = cva("flex min-h-0 flex-1 flex-col gap-3 sm:gap-4");

export const modalHeader = cva("flex flex-col gap-1.5");

export const overviewContainer = cva("flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto sm:gap-4");

export const dropzone = cva(
  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-7 text-center transition-colors sm:py-10",
  {
    variants: {
      active: {
        true: "border-primary-400 bg-primary-500/10",
        false: "border-fg/15 hover:border-fg/30 bg-surface/30",
      },
    },
    defaultVariants: { active: false },
  }
);

export const dropzoneTitle = cva("text-fg text-sm font-medium");

export const dropzoneHint = cva("text-fg/50 text-xs");

export const progressWrap = cva("flex flex-col gap-2 py-2");

export const progressLabel = cva("text-fg/60 text-center text-xs");

export const sectionHeader = cva("text-fg/50 pt-1 text-[11px] font-medium tracking-wide uppercase");

export const errorText = cva("text-destructive-vivid text-xs");

export const mutedText = cva("text-fg/60 text-sm");

export const rejectedPanel = cva("border-destructive/25 bg-destructive/5 flex flex-col gap-1.5 rounded-lg border p-3");

export const rejectedRow = cva("flex items-baseline justify-between gap-3 text-xs");

export const rejectedName = cva("text-fg/80 min-w-0 truncate");

export const rejectedReason = cva("text-fg/50 shrink-0");

export const batchList = cva("flex flex-col gap-1");

export const batchRow = cva("hover:bg-fg/5 flex items-center gap-2 rounded-lg px-2 py-1.5");

export const batchRowButton = cva("flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left");

export const batchRowInfo = cva("flex min-w-0 flex-1 flex-col");

export const batchRowTitle = cva("text-fg truncate text-sm");

export const batchRowMeta = cva("text-fg/50 truncate text-xs");

export const statusChip = cva("inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-medium", {
  variants: {
    tone: {
      neutral: "bg-fg/10 text-fg/60",
      active: "bg-primary-500/15 text-primary-400",
      info: "bg-secondary-500/15 text-secondary-400",
      success: "bg-success-vivid/15 text-success-vivid",
      warning: "bg-warning-vivid/15 text-warning-vivid",
      danger: "bg-destructive/15 text-destructive-vivid",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export type StatusChipTone = NonNullable<VariantProps<typeof statusChip>["tone"]>;

export const detailHeader = cva("flex flex-wrap items-center gap-2");

export const detailCounts = cva("text-fg/50 flex flex-wrap gap-x-3 gap-y-0.5 text-xs");

export const fileList = cva("flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto");

export const fileRow = cva("hover:bg-fg/5 flex items-center gap-2.5 rounded-lg px-2 py-1.5");

export const fileInfo = cva("flex min-w-0 flex-1 flex-col");

export const fileName = cva("text-fg truncate text-sm");

export const fileMeta = cva("text-fg/50 truncate text-xs");

export const fileError = cva("text-destructive-vivid truncate text-xs");

export const fileActions = cva("flex shrink-0 items-center gap-1.5");

export const matchPanel = cva("border-fg/10 bg-surface/40 mx-2 mb-1.5 flex flex-col gap-2 rounded-lg border p-2.5");

export const matchSearchInput = cva(
  "bg-surface/40 border-fg/15 focus:border-primary-400 text-fg h-8 w-full rounded-lg border px-2.5 text-xs outline-none"
);

export const matchResultList = cva("flex max-h-56 flex-col gap-1 overflow-y-auto");

export const matchResultRow = cva("hover:bg-fg/5 flex items-center gap-2.5 rounded-lg px-2 py-1.5");

export const trackThumb = cva("size-9 shrink-0 rounded object-cover");

export const trackThumbFallback = cva("bg-fg/10 size-9 shrink-0 rounded");

export const trackInfo = cva("flex min-w-0 flex-1 flex-col");

export const trackTitle = cva("text-fg truncate text-sm");

export const trackArtist = cva("text-fg/50 truncate text-xs");

export const trackMeta = cva("text-fg/40 hidden shrink-0 text-[11px] tabular-nums sm:block");
