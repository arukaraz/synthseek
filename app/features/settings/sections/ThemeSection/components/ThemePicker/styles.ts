import { cva } from "class-variance-authority";

export const themeGrid = cva("grid grid-cols-2 gap-3 md:grid-cols-4");

export const themeCard = cva(
  "group focus-visible:outline-ring relative flex min-w-0 cursor-pointer flex-col gap-2 rounded-xl border p-2 text-left transition-[border-color,box-shadow,background-color] focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100",
  {
    variants: {
      selected: {
        true: "border-primary-500 ring-primary-500 shadow-neon-primary ring-1",
        false: "border-border hover:border-fg/30 hover:bg-fg/[0.03]",
      },
    },
    defaultVariants: { selected: false },
  }
);

export const themeCardPreview = cva("border-border relative aspect-video w-full overflow-hidden rounded-lg border");

export const themeCardFooter = cva("flex min-w-0 items-center gap-2 px-0.5");

export const themeCardIndicator = cva(
  "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors motion-reduce:transition-none",
  {
    variants: {
      selected: {
        true: "border-primary-500 bg-primary-500 text-primary-foreground",
        false: "border-fg-muted bg-transparent",
      },
    },
    defaultVariants: { selected: false },
  }
);

export const themeCardIndicatorCheck = cva("size-3");

export const themeCardLabel = cva("text-fg min-w-0 truncate text-sm font-semibold");

export const themePreviewWindow = cva("bg-surface absolute inset-0 grid grid-cols-[22%_1fr]");

export const themePreviewRail = cva("bg-surface-elevated flex min-w-0 flex-col gap-[5px] px-[22%] py-[14%]");

export const themePreviewRailBar = cva("h-[5px] rounded-[3px]", {
  variants: {
    active: {
      true: "bg-primary-500",
      false: "bg-fg-muted opacity-60",
    },
  },
  defaultVariants: { active: false },
});

export const themePreviewBody = cva("flex min-w-0 flex-col gap-1.5 p-[9%]");

export const themePreviewBar = cva("bg-fg h-1.5 rounded-[3px]", {
  variants: {
    line: {
      title: "w-[62%]",
      text: "w-[90%] opacity-45",
      hint: "w-[44%] opacity-25",
    },
  },
  defaultVariants: { line: "text" },
});

export const themePreviewChip = cva(
  "from-primary-500 to-accent-500 mt-auto h-[11px] w-[34%] self-start rounded-full bg-linear-to-r"
);

export const themeCaption = cva("text-fg/60 text-sm");

export const themeEditLink = cva(
  "text-primary-400 focus-visible:ring-ring ml-1 cursor-pointer rounded-sm underline underline-offset-2 outline-none hover:no-underline focus-visible:ring-2"
);
