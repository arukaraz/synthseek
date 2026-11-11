import { cva } from "class-variance-authority";

export const inlineCode = cva("bg-fg/10 text-fg/85 rounded px-1 py-0.5 font-mono text-[0.85em]");

export const inlineLink = cva(
  "text-accent-400 hover:text-accent-500 decoration-accent-400/50 hover:decoration-accent-400 font-medium underline underline-offset-2 transition-colors"
);

export const calloutBox = cva("mb-3 flex flex-col gap-1 rounded-xl border px-3.5 py-2.5 text-sm", {
  variants: {
    tone: {
      important: "border-primary-500/30 bg-primary-500/10 text-fg/75",
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

export const issuesRow = cva("text-fg/45 mt-3 flex flex-wrap items-center gap-2 text-xs");
export const issueLink = cva("text-primary-400 font-mono hover:underline");
