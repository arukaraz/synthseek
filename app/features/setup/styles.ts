import { cva } from "class-variance-authority";

export const wizardCard = cva(
  "auth-card relative z-10 mx-auto flex max-h-[calc(100dvh-3rem)] w-full max-w-lg flex-col rounded-3xl border border-fg/[0.09] sm:max-w-[34rem] sm:backdrop-blur-[18px]"
);

export const wizardHead = cva("flex flex-col gap-4 px-6 pt-6 sm:px-9 sm:pt-9");

export const wizardBrand = cva("flex flex-col items-center gap-1.5");

export const wizardEyebrow = cva("text-fg-muted text-[0.6875rem] font-bold uppercase tracking-[0.18em]");

export const stepProgress = cva("flex items-center gap-1.5");

export const stepIndicator = cva("h-1.5 rounded-full transition-all", {
  variants: {
    state: {
      completed: "bg-primary-500/45 flex-1",
      current: "bg-primary-500 shadow-[0_0_12px_-2px_var(--color-primary-500)] flex-[1.6]",
      upcoming: "bg-fg/10 flex-1",
    },
  },
  defaultVariants: { state: "upcoming" },
});

export const wizardBody = cva("flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5 sm:px-9");

export const stepHeader = cva("flex flex-col gap-1.5");

export const stepTitle = cva("text-fg text-xl font-bold focus-visible:outline-none sm:text-2xl");

export const stepDescription = cva("text-fg-muted text-sm");

export const stepBody = cva("flex flex-col gap-4");

export const stepFooter = cva(
  "border-fg/10 flex flex-col gap-2.5 border-t px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-9"
);

export const stepFooterTrailing = cva("flex flex-col gap-2.5 sm:flex-row-reverse sm:items-center");

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

export const fieldLabel = cva("text-fg-muted text-xs font-semibold");

export const fieldHint = cva("text-fg-muted text-xs");

export const fieldError = cva("text-[oklch(var(--neon-error))] text-xs");

export const fieldWarning = cva("text-plex-500 text-xs");

export const slskdTestRow = cva("flex flex-wrap items-center gap-3");

export const slskdTestButton = cva(
  "border-fg/15 bg-fg/[0.04] text-fg hover:border-fg/25 focus-visible:ring-primary-500/50 inline-flex min-h-11 items-center justify-center gap-2 rounded-[0.6875rem] border px-4 text-sm font-semibold outline-none transition-colors hover:bg-fg/[0.08] focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
);

export const doneCard = cva("flex items-center gap-3 rounded-2xl border p-4 transition-opacity", {
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

export const doneCardHeading = cva("text-fg text-sm font-medium");

export const doneCardBody = cva("text-fg-muted text-xs");

export const serverPickerCard = cva("border-fg/15 bg-fg/[0.04] flex flex-col gap-2 rounded-2xl border p-3");

export const serverPickerIntro = cva("text-fg-muted text-xs");

export const wizardPickerButton = cva(
  "border-fg/15 bg-fg/[0.03] hover:bg-fg/[0.07] hover:border-fg/25 focus-visible:ring-primary-500/50 flex min-h-11 items-center justify-between gap-3 rounded-[0.6875rem] border px-3 py-2 text-left transition-all hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2"
);

export const serverPickerName = cva("text-fg truncate text-sm font-medium");

export const serverPickerUri = cva("text-fg-muted truncate font-mono text-[11px]");

export const serverPickerLocation = cva(
  "text-fg-muted bg-fg/10 ring-fg/10 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1"
);

export const plexIntro = cva("text-fg-muted flex items-center gap-2 text-sm");

export const skeletonBlock = cva("bg-fg/10 rounded");
