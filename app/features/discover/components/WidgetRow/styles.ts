import { cva } from "class-variance-authority";

export const widgetList = cva("flex flex-col gap-0.5");

export const widgetRow = cva(
  "group/row relative flex min-w-0 items-center gap-3 rounded-lg px-1.5 py-1.5 transition-colors",
  {
    variants: {
      interactive: {
        true: "hover:bg-fg/[0.07] has-[:focus-visible]:bg-fg/[0.07]",
        false: "",
      },
    },
    defaultVariants: { interactive: false },
  }
);

export const widgetRowMain = cva("flex min-w-0 flex-1 items-center gap-3 text-left", {
  variants: {
    interactive: {
      true: "outline-none after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-primary-400",
      false: "",
    },
  },
  defaultVariants: { interactive: false },
});

export const widgetRowCover = cva("bg-surface-sunken relative size-10 shrink-0 overflow-hidden rounded-md");

export const widgetRowCoverAction = cva(
  "text-overlay-fg focus-visible:ring-primary-400 absolute inset-0 z-10 flex items-center justify-center bg-black/55 opacity-0 transition-opacity outline-none group-hover/row:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-inset [@media(hover:none)]:bg-black/35 [@media(hover:none)]:opacity-100 [&_svg]:size-4 [&_svg]:fill-current"
);

export const widgetRowCopy = cva("flex min-w-0 flex-col");

export const widgetRowTitle = cva("text-fg truncate text-[13px] font-medium");

export const widgetRowSubtitle = cva("text-fg/60 truncate text-[11.5px]");

export const widgetRowLead = cva("text-fg/40 w-5 shrink-0 text-right font-mono text-[12px]");

export const widgetRowTrailing = cva(
  "text-fg/60 relative z-10 flex shrink-0 items-center gap-1.5 font-mono text-[11px]"
);

export const widgetRowButton = cva("h-8 shrink-0 px-3 font-sans text-xs");

export const coverFallback = cva("absolute inset-0");
