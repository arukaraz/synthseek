import { cva } from "class-variance-authority";

export const setupProgressTrack = cva("bg-fg/10 pointer-events-none fixed inset-x-0 top-0 z-20 h-[3px]");

export const setupProgressFill = cva(
  "from-primary-500 to-secondary-500 bg-linear-to-r block h-full transition-[width] duration-300 motion-reduce:transition-none"
);

export const setupAsk = cva(
  "bg-surface/60 relative z-10 mx-auto flex w-full max-w-[40rem] flex-col gap-[1.375rem] rounded-3xl px-5 py-6 backdrop-blur-md sm:px-8 sm:py-8 reduce-transparency:bg-surface reduce-transparency:backdrop-blur-none"
);

export const setupEyebrow = cva("text-primary-400 font-mono text-12 tracking-wide uppercase");

export const setupQuestion = cva(
  "text-fg text-balance text-2xl leading-[1.12] font-bold tracking-tight focus-visible:outline-none sm:text-4xl"
);

export const setupDescription = cva("text-fg-muted text-sm");

export const setupFooter = cva("border-fg/10 flex items-center justify-between gap-3 border-t pt-3");

export const setupForm = cva("flex flex-col gap-[1.375rem]");

export const setupColumn = cva("flex min-w-0 flex-col gap-3");

export const setupActions = cva("flex flex-wrap items-center gap-2.5");

export const setupActionIcon = cva("size-4 shrink-0");

export const choiceTiles = cva("grid grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] gap-2");

export const choiceTile = cva(
  "has-focus-visible:ring-primary-500 flex cursor-pointer flex-col gap-0.5 rounded-xl border p-4 text-left transition-colors hover:bg-fg/[0.07] has-focus-visible:ring-2 has-disabled:cursor-not-allowed has-disabled:opacity-60 motion-reduce:transition-none",
  {
    variants: {
      selected: {
        true: "border-primary-500 bg-primary-500/15",
        false: "border-fg/15 bg-fg/[0.035]",
      },
    },
    defaultVariants: { selected: false },
  }
);

export const choiceInput = cva("sr-only");

export const setupProgressText = cva("text-fg-muted text-12");

export const setupHeader = cva("flex flex-col gap-2");

export const choiceTileTitle = cva("text-fg text-base font-semibold");

export const choiceTileCaption = cva("text-fg-muted text-12");

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

export const fieldHint = cva("text-fg-muted text-xs");

export const fieldError = cva("text-destructive-vivid text-xs");

export const testRow = cva("flex flex-wrap items-center gap-3");

export const testButton = cva(
  "border-fg/15 bg-fg/[0.04] text-fg hover:border-fg/25 focus-visible:ring-primary-500 inline-flex h-9 items-center justify-center gap-2 rounded-[0.625rem] border px-3 text-13 font-bold outline-none transition-colors hover:bg-fg/[0.08] focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
);

export const serverPickerCard = cva("border-fg/15 bg-fg/[0.04] flex flex-col gap-2 rounded-2xl border p-3");

export const serverPickerIntro = cva("text-fg-muted text-xs");

export const wizardPickerButton = cva(
  "border-fg/15 bg-fg/[0.03] hover:bg-fg/[0.07] hover:border-fg/25 focus-visible:ring-primary-500 flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-all hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
);

export const serverPickerName = cva("text-fg truncate text-sm font-medium");

export const serverPickerUri = cva("text-fg-muted truncate font-mono text-11");

export const serverPickerLocation = cva(
  "text-fg-muted bg-fg/10 ring-fg/10 shrink-0 rounded px-1.5 py-0.5 text-10 font-semibold uppercase tracking-wider ring-1"
);

export const plexIntro = cva("text-fg-muted flex items-center gap-2 text-sm");

export const summaryList = cva("flex flex-col gap-2");

export const summaryRow = cva(
  "border-fg/10 bg-fg/[0.03] flex items-center justify-between gap-2.5 rounded-[0.625rem] border px-3 py-2 text-13"
);

export const summaryLabel = cva("text-fg-muted");

export const summaryPill = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-11 font-semibold whitespace-nowrap",
  {
    variants: {
      outcome: {
        answered: "border-success-vivid/40 bg-success-vivid/10 text-success-vivid",
        skipped: "border-fg/15 text-fg-muted",
        open: "border-fg/15 text-fg-muted",
      },
    },
    defaultVariants: { outcome: "open" },
  }
);

export const skeletonBlock = cva("bg-fg/10 rounded");
