import { cva } from "class-variance-authority";

export const inlineCode = cva("bg-fg/10 text-fg/85 rounded px-1 py-0.5 font-mono text-[0.85em]");

export const pageRoot = cva("mx-auto flex w-full max-w-3xl flex-col p-4 sm:p-6 lg:p-10");

export const headerRoot = cva("mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-start sm:justify-between");
export const headerTitleBlock = cva("flex flex-col gap-2");
export const titleRow = cva("flex items-center gap-2");
export const title = cva("text-fg text-2xl font-extrabold tracking-tight sm:text-3xl");
export const titleInfo = cva("text-fg/40");
export const metaRow = cva("text-fg/55 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm");
export const metaVersion = cva(
  "text-fg bg-fg/5 ring-fg/10 rounded-md px-2 py-0.5 font-mono text-xs font-medium ring-1"
);
export const metaSep = cva("text-fg/35");
export const metaChecked = cva("text-fg/45 font-mono text-xs");
export const checkButton = cva(
  "text-fg/70 bg-fg/[0.03] ring-fg/15 hover:text-fg hover:bg-fg/[0.06] inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold ring-1 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
);

export const timeline = cva("relative mt-2 pl-9");
export const timelineLine = cva(
  "pointer-events-none absolute top-2 bottom-4 left-3.5 w-0.5 rounded bg-gradient-to-b from-cyan-400/80 via-primary-500/50 to-fg/10"
);
export const entry = cva("relative mb-7 last:mb-3.5");

export const node = cva("ring-background absolute grid place-items-center rounded-full ring-4", {
  variants: {
    variant: {
      latest: "top-2 -left-7 size-[18px] bg-cyan-400 shadow-[0_0_18px_-2px_var(--color-cyan-400)]",
      new: "top-2 -left-7 size-[18px] bg-cyan-400/90",
      current: "bg-primary-500 top-2 -left-7 size-[18px]",
      past: "bg-fg/35 top-3 -left-6 size-2.5",
    },
  },
  defaultVariants: { variant: "past" },
});
export const nodePing = cva("absolute inline-flex size-full animate-ping rounded-full bg-cyan-400/70");
export const nodeCheck = cva("text-primary-foreground size-3");

export const card = cva("rounded-2xl border", {
  variants: {
    variant: {
      latest:
        "border-cyan-400/30 from-cyan-400/[0.06] to-primary-500/[0.04] bg-gradient-to-b p-5 shadow-[0_0_32px_-12px_var(--color-cyan-400)] sm:p-6",
      new: "border-cyan-400/20 bg-fg/[0.02] p-4 sm:p-5",
      current: "border-fg/10 from-fg/[0.025] to-fg/[0.006] bg-gradient-to-b p-4 sm:p-5",
      past: "border-fg/10 bg-fg/[0.013] p-3.5 sm:p-4",
    },
  },
  defaultVariants: { variant: "past" },
});

export const cardTopPast = cva("flex items-start justify-between gap-3");
export const vRow = cva("mb-1.5 flex flex-wrap items-center gap-2");
export const vRowPast = cva("flex flex-wrap items-center gap-2");

export const version = cva("font-mono font-bold", {
  variants: {
    variant: {
      latest: "text-cyan-300 text-base sm:text-lg",
      new: "text-cyan-300 text-sm",
      current: "text-fg text-sm sm:text-base",
      past: "text-fg/60 text-sm",
    },
  },
  defaultVariants: { variant: "past" },
});

export const badge = cva("rounded px-1.5 py-0.5 font-mono text-[9.5px] font-bold tracking-[0.16em] uppercase", {
  variants: {
    tone: {
      new: "bg-cyan-400/20 text-cyan-100 ring-1 ring-cyan-400/40",
      current: "bg-primary-500/18 text-primary-200 ring-primary-500/40 ring-1",
    },
  },
});

export const date = cva("text-fg/45 font-mono text-[11px]");

export const headline = cva("font-bold tracking-tight", {
  variants: {
    variant: {
      latest: "text-fg mb-3 text-base sm:text-lg",
      new: "text-fg mb-3 text-sm sm:text-base",
      current: "text-fg mb-3 text-sm sm:text-base",
      past: "text-fg/70 text-sm font-semibold",
    },
  },
  defaultVariants: { variant: "past" },
});

export const youHereInline = cva(
  "text-primary-300 inline-flex items-center gap-1 font-mono text-[9.5px] font-bold tracking-[0.14em] uppercase lg:hidden"
);
export const youHereAbs = cva(
  "text-primary-300 absolute top-2 -left-[58px] hidden font-mono text-[9.5px] font-bold tracking-[0.14em] whitespace-nowrap uppercase lg:block"
);

export const calloutBox = cva("mb-3 flex flex-col gap-1 rounded-xl border px-3.5 py-2.5 text-sm", {
  variants: {
    tone: {
      important: "border-primary-500/30 bg-primary-500/10 text-primary-100",
      warning: "border-amber-500/30 bg-amber-500/10 text-amber-100",
      note: "border-fg/15 bg-fg/5 text-fg/75",
    },
  },
  defaultVariants: { tone: "note" },
});
export const calloutLabel = cva("text-[11px] font-semibold tracking-wider uppercase");

export const notes = cva("m-0 flex list-none flex-col gap-2.5 p-0");
export const note = cva("text-fg/85 flex items-start gap-3 text-sm leading-relaxed");
export const noteLead = cva("text-fg/75 text-sm leading-relaxed");

export const kind = cva(
  "mt-0.5 min-w-[44px] shrink-0 rounded px-1.5 py-0.5 text-center font-mono text-[9.5px] font-bold tracking-[0.14em] uppercase",
  {
    variants: {
      category: {
        feature: "bg-emerald-500/15 text-emerald-300",
        fix: "bg-red-500/15 text-red-300",
        improvement: "bg-amber-500/15 text-amber-300",
        breaking: "bg-red-500/15 text-red-300",
        chore: "text-fg/55 bg-fg/8",
      },
    },
  }
);

export const expandButton = cva(
  "text-fg/55 ring-fg/10 hover:text-fg hover:bg-fg/5 inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ring-1 transition-colors"
);
export const expandIcon = cva("size-3.5 transition-transform");
export const pastBody = cva("mt-3");

export const issuesRow = cva("text-fg/45 mt-3 flex flex-wrap items-center gap-2 text-xs");
export const issueLink = cva("text-primary-300 font-mono hover:underline");

export const endWrap = cva("relative mt-1");
export const endNode = cva(
  "border-fg/40 bg-background absolute top-0 -left-6 size-3 rounded-full border border-dashed"
);
export const endLink = cva(
  "text-primary-300 hover:text-primary-200 inline-flex items-center gap-1.5 pl-3.5 text-[13px] font-semibold hover:underline"
);

export const loadingState = cva("flex items-center justify-center py-10");
export const emptyState = cva(
  "border-fg/10 bg-fg/5 text-fg/55 flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center text-sm"
);
