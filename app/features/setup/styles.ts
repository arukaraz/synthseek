import { cva } from "class-variance-authority";

export const stepShellRoot = cva(
  "bg-surface/80 border-fg/10 mx-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col rounded-2xl border shadow-2xl backdrop-blur-xl"
);

export const stepShellScroll = cva("flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6 sm:p-8");

export const stepProgress = cva("flex items-center gap-1.5");

export const stepIndicator = cva("h-1.5 flex-1 rounded-full transition-colors", {
  variants: {
    state: {
      filled: "bg-primary-500",
      empty: "bg-fg/10",
    },
  },
  defaultVariants: { state: "empty" },
});

export const stepEyebrow = cva("text-fg/50 text-[11px] font-semibold uppercase tracking-wider");

export const stepHeader = cva("flex flex-col gap-1.5");

export const stepTitle = cva("text-fg text-2xl font-bold focus-visible:outline-none");

export const stepDescription = cva("text-fg/60 text-sm");

export const stepBody = cva("flex flex-col gap-3");

export const stepFooter = cva(
  "border-fg/10 bg-surface/80 flex flex-col gap-3 border-t p-6 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-8 sm:py-5"
);

export const stepFooterTrailing = cva("flex flex-col gap-2 sm:flex-row-reverse sm:items-center");

export const stepPrimaryButton = cva(
  "min-h-11 w-full font-medium shadow-lg shadow-primary-500/20 focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 sm:w-auto disabled:opacity-100",
  {
    variants: {
      blocked: {
        true: "border-fg/20 bg-fg/15 text-fg/55 cursor-not-allowed border shadow-none",
        false: "bg-primary-500 text-fg hover:bg-primary-600",
      },
    },
    defaultVariants: { blocked: false },
  }
);

export const stepSecondaryButton = cva("min-h-11 w-full sm:w-auto");

export const stepBackButton = cva("min-h-11 w-full sm:order-first sm:w-auto");

export const statusStrip = cva("status-strip", {
  variants: {
    tone: {
      success: "status-strip-success",
      error: "status-strip-error",
      neutral: "status-strip-neutral",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export const statusStripGlyph = cva("status-strip-glyph size-4");

export const statusStripBody = cva("status-strip-body");

export const statusStripAction = cva(
  "self-start text-left text-xs font-medium underline underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-1 focus-visible:ring-offset-transparent"
);

export const fieldGroup = cva("flex flex-col gap-1.5");

export const fieldLabel = cva("text-fg/50 text-[11px] font-semibold uppercase tracking-wider");

export const fieldHint = cva("text-fg/55 text-xs");

export const fieldError = cva("text-red-400 text-xs");

export const fieldWarning = cva("text-amber-400 text-xs");

export const slskdTestRow = cva("flex flex-wrap items-center gap-3");

export const doneCard = cva("flex items-center gap-3 rounded-xl border p-4 transition-opacity", {
  variants: {
    deemphasized: {
      true: "border-fg/5 bg-fg/[0.02] opacity-50",
      false: "border-fg/10 bg-fg/[0.04] opacity-100",
    },
  },
  defaultVariants: { deemphasized: false },
});

export const doneCheckBadge = cva(
  "bg-primary-500/15 text-primary-300 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
);

export const serverPickerCard = cva("border-fg/10 bg-fg/[0.04] flex flex-col gap-2 rounded-xl border p-3");

export const wizardPickerButton = cva(
  "border-fg/10 hover:bg-fg/5 hover:border-fg/20 flex min-h-11 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
);

export const serverPickerName = cva("text-fg truncate text-sm font-medium");

export const serverPickerUri = cva("text-fg/45 truncate font-mono text-[11px]");

export const serverPickerLocation = cva(
  "text-fg/55 bg-fg/10 ring-fg/10 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1"
);

export const skeletonRoot = cva(
  "bg-surface/80 border-fg/10 mx-auto flex w-full max-w-xl animate-pulse flex-col gap-6 rounded-2xl border p-6 shadow-2xl backdrop-blur-xl sm:p-8"
);

export const skeletonBlock = cva("bg-fg/10 rounded");
