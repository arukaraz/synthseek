import { cva } from "class-variance-authority";

export const tipBadge = cva(
  "border-accent-500/40 bg-accent-500/15 text-accent-400 hover:bg-accent-500/25 focus-visible:ring-ring inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 [&_svg]:size-3.5",
  {
    variants: {
      seen: {
        true: "",
        false: "animate-tip-halo",
      },
    },
  }
);

export const tipContent = cva("flex max-w-xs flex-col gap-2.5 p-4");

export const tipHeading = cva("text-accent-400 text-xs font-bold tracking-wide uppercase");

export const tipBody = cva("text-fg/85 text-sm leading-relaxed");

export const tipAction = cva(
  "text-accent-400 focus-visible:ring-ring self-start rounded-sm text-sm font-semibold underline-offset-2 outline-none hover:underline focus-visible:ring-2"
);
