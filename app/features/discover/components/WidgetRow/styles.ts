import { cva } from "class-variance-authority";

export const widgetList = cva(
  "flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
);

export const widgetRow = cva("flex min-w-0 items-center gap-3 rounded-lg px-1.5 py-1.5");

export const widgetRowMain = cva("flex min-w-0 flex-1 items-center gap-3 text-left", {
  variants: {
    interactive: {
      true: "focus-visible:ring-primary-400 -m-1 rounded-md p-1 outline-none hover:opacity-90 focus-visible:ring-2",
      false: "",
    },
  },
  defaultVariants: { interactive: false },
});

export const widgetRowCover = cva("bg-surface-sunken relative size-10 shrink-0 overflow-hidden", {
  variants: {
    round: {
      true: "rounded-full",
      false: "rounded-md",
    },
  },
  defaultVariants: { round: false },
});

export const widgetRowCopy = cva("flex min-w-0 flex-col");

export const widgetRowTitle = cva("text-fg truncate text-[13px] font-medium");

export const widgetRowSubtitle = cva("text-fg/60 truncate text-[11.5px]");

export const widgetRowLead = cva("text-fg/40 w-5 shrink-0 text-right font-mono text-[12px]");

export const widgetRowTrailing = cva("text-fg/60 flex shrink-0 items-center gap-1.5 font-mono text-[11px]");

export const coverFallback = cva("absolute inset-0");
