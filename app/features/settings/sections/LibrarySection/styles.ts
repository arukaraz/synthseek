import { cva } from "class-variance-authority";

export const previewTemplate = cva(
  "bg-fg/5 text-fg/80 mt-3 truncate rounded-md px-3 py-2.5 font-mono text-xs tabular-nums select-all"
);

export const previewBody = cva("flex w-full min-w-0 flex-col gap-4");

export const previewTitleRow = cva("flex min-w-0 items-center gap-2");

export const infoBody = cva("flex flex-col gap-2.5");

export const infoList = cva("flex flex-col gap-2.5");

export const infoEntry = cva("flex flex-col gap-0.5");

export const infoTerm = cva("text-fg/90 text-xs font-semibold");

export const infoText = cva("text-fg/70 text-xs leading-snug");

export const infoExample = cva("text-fg/50 font-mono text-[11px] leading-snug break-words");

export const infoNote = cva("text-fg/70 text-xs leading-snug");

export const previewToolbar = cva("flex w-full min-w-0 flex-wrap items-center gap-2.5");

export const previewSearchBox = cva("relative min-w-40 flex-1");

export const previewSearch = cva(
  "bg-fg/5 focus:ring-accent/40 placeholder:text-fg/40 h-8 w-full rounded-md pr-2 pl-8 text-sm outline-none focus:ring-2"
);

export const previewTable = cva(
  "border-fg/10 flex max-h-[38vh] w-full min-w-0 flex-col overflow-x-hidden overflow-y-auto rounded-md border"
);

export const previewHead = cva(
  "border-fg/10 bg-surface text-fg/50 sticky top-0 z-10 flex w-full min-w-0 items-center gap-2 border-b px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase"
);

export const previewRow = cva(
  "border-fg/5 flex w-full min-w-0 items-center gap-3 border-b px-3 py-2.5 text-xs last:border-b-0"
);

export const previewFooterRow = cva("border-fg/10 flex flex-wrap items-center justify-between gap-3 border-t pt-4");

export const previewCount = cva("text-fg/50 text-xs tabular-nums");

export const previewFrom = cva("text-fg/50 w-0 min-w-0 flex-1 truncate");

export const previewTo = cva("text-fg/90 w-0 min-w-0 flex-1 truncate");

export const previewScopeNote = cva("text-fg/60 text-xs");

export const tokenGroup = cva("flex flex-col gap-2.5");

export const tokenGroupTitle = cva(
  "text-fg/40 border-fg/10 border-b pb-1.5 text-[11px] font-semibold tracking-widest uppercase"
);

export const tokenGrid = cva("grid gap-1.5 sm:grid-cols-2");

export const tokenCell = cva(
  "border-fg/10 hover:border-primary-400/60 hover:bg-fg/5 flex min-w-0 items-start gap-3 rounded-md border px-2.5 py-2 text-left transition-colors"
);

export const tokenName = cva("text-fg/90 w-32 shrink-0 font-mono text-xs");

export const tokenExample = cva("text-fg/55 min-w-0 flex-1 text-xs leading-snug");

export const tokensRules = cva("text-fg/60 flex list-disc flex-col gap-1 pl-4 text-xs leading-relaxed");

export const tokensFooterInput = cva(
  "border-fg/10 bg-fg/5 focus:ring-accent/40 h-9 w-full min-w-0 flex-1 rounded-md border px-3 font-mono text-xs outline-none focus:ring-2"
);

export const templateRow = cva("flex w-full min-w-0 items-center gap-2");

export const progressWrap = cva("border-fg/10 flex flex-col gap-2 rounded-md border p-3");

export const progressTop = cva("flex items-baseline justify-between gap-3");

export const progressPercent = cva("text-fg text-lg font-semibold tabular-nums");

export const progressCounts = cva("text-fg/60 text-xs tabular-nums");

export const progressBottom = cva("flex items-center justify-between gap-3");

export const sampleList = cva("border-fg/10 flex flex-col gap-1.5 rounded-md border p-3");

export const sampleRow = cva("flex flex-col gap-0.5");

export const sampleLabel = cva("text-fg/50 text-[11px]");

export const samplePath = cva("text-fg/80 truncate font-mono text-xs");

export const statStrip = cva("flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-2 text-sm");

export const statPair = cva("flex items-baseline gap-1.5");

export const statNumber = cva("text-fg font-semibold tabular-nums");

export const statWord = cva("text-fg/60");

export const listFrame = cva("border-fg/10 @container flex flex-col overflow-clip rounded-xl border");

export const listHead = cva(
  "border-fg/10 bg-surface text-fg/50 sticky top-0 z-10 hidden items-center gap-4 border-b px-4 py-2 text-[11px] font-semibold tracking-wider uppercase @3xl:grid",
  {
    variants: {
      layout: {
        paths: "@3xl:grid-cols-[minmax(0,1fr)_7rem_9rem_6rem_7.5rem]",
        rules: "@3xl:grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1.3fr)_9rem_7rem]",
      },
    },
  }
);

export const listHeadEnd = cva("text-right");

export const listRow = cva("border-fg/10 flex flex-col gap-3 border-b px-4 py-3 last:border-b-0");

export const listRowGrid = cva("grid grid-cols-2 items-center gap-x-4 gap-y-2", {
  variants: {
    layout: {
      paths: "@3xl:grid-cols-[minmax(0,1fr)_7rem_9rem_6rem_7.5rem]",
      rules: "@3xl:grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1.3fr)_9rem_7rem]",
    },
  },
});

export const rowIdentity = cva("col-span-2 flex min-w-0 flex-col gap-1 @3xl:col-span-1");

export const rowTitleLine = cva("flex min-w-0 flex-wrap items-center gap-2");

export const rowTitle = cva("text-fg truncate text-sm font-semibold");

export const rowEnvironmentLock = cva("text-fg/50 inline-flex shrink-0 items-center");

export const rowFolder = cva("text-fg/50 truncate font-mono text-xs");

export const rowStat = cva("flex min-w-0 flex-col gap-1");

export const rowStatMain = cva("text-fg text-sm font-medium tabular-nums");

export const rowStatSub = cva("text-fg/50 truncate text-xs tabular-nums");

export const rowActions = cva("flex items-center justify-end gap-3", {
  variants: {
    layout: {
      paths: "",
      rules: "col-span-2 @3xl:col-span-1",
    },
  },
  defaultVariants: { layout: "paths" },
});

export const rowOrder = cva("flex items-center gap-1");

export const accessBadge = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
  {
    variants: {
      tone: {
        success: "bg-success-vivid/10 text-success-vivid ring-success-vivid/30",
        warning: "bg-warning-vivid/10 text-warning-vivid ring-warning-vivid/30",
        danger: "bg-destructive-vivid/10 text-destructive-vivid ring-destructive-vivid/30",
        muted: "bg-fg/5 text-fg/60 ring-fg/10",
      },
    },
    defaultVariants: { tone: "muted" },
  }
);

export const formStack = cva("mt-5 flex flex-col gap-5");

export const formGrid = cva("grid gap-4 sm:grid-cols-2");

export const fieldMessage = cva("text-xs leading-snug", {
  variants: {
    tone: {
      neutral: "text-fg/55",
      success: "text-success-vivid",
      danger: "text-destructive-vivid",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export const toggleRow = cva("border-fg/10 flex items-start justify-between gap-4 rounded-lg border p-3");

export const toggleText = cva("flex min-w-0 flex-col gap-0.5");

export const toggleTitle = cva("text-fg text-sm font-medium");

export const toggleHint = cva("text-fg/60 text-xs leading-snug");

export const choiceList = cva("border-fg/10 flex max-h-56 flex-col overflow-y-auto rounded-lg border");

export const choiceRow = cva("border-fg/5 flex items-center gap-3 border-b px-3 py-2 last:border-b-0", {
  variants: {
    taken: {
      true: "opacity-60",
      false: "cursor-pointer",
    },
  },
  defaultVariants: { taken: false },
});

export const choiceText = cva("flex min-w-0 flex-1 flex-col");

export const choiceName = cva("text-fg truncate text-sm font-medium");

export const choiceSummary = cva("text-fg/50 truncate text-xs");

export const choiceOwner = cva("text-fg/50 shrink-0 text-[11px]");

export const namingFooter = cva("flex flex-wrap items-center justify-between gap-2");

export const modalFooter = cva("border-fg/10 flex flex-wrap items-center gap-2 border-t pt-4 sm:justify-end");

export const footerStart = cva("mr-auto");

export const checkRow = cva("flex flex-wrap items-center justify-between gap-3");

export const conditionList = cva("flex flex-col gap-2");

export const conditionRow = cva(
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,1.2fr)_auto]"
);

export const conditionCell = cva("col-span-2 min-w-0 sm:col-span-1");

export const analysisFacts = cva("grid grid-cols-1 gap-3 sm:grid-cols-3");

export const analysisFact = cva("flex min-w-0 flex-col gap-0.5");

export const analysisFactLabel = cva("text-fg/60 text-xs");

export const analysisFactValue = cva("text-fg text-sm font-medium tabular-nums");

export const analysisRow = cva("flex flex-wrap items-center gap-3");
