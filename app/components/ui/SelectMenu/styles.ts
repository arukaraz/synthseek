import { cva } from "class-variance-authority";

export const selectMenuTrigger = cva(
  "border-fg/10 bg-fg/5 text-fg hover:border-primary-500/30 flex w-full min-w-0 items-center justify-between gap-3 border text-left transition-colors disabled:cursor-not-allowed",
  {
    variants: {
      size: {
        md: "border-fg/15 h-10 gap-2 rounded-lg px-3 text-sm disabled:opacity-60",
        lg: "text-fg/80 hover:bg-fg/10 rounded-lg px-3 py-2.5 disabled:pointer-events-none disabled:opacity-40",
      },
    },
    defaultVariants: { size: "md" },
  }
);

export const selectMenuValue = cva("min-w-0 flex-1", {
  variants: {
    size: { md: "truncate", lg: "" },
  },
  defaultVariants: { size: "md" },
});

export const selectMenuLabel = cva("block truncate", {
  variants: {
    size: { md: "", lg: "text-sm font-bold" },
  },
  defaultVariants: { size: "md" },
});

export const selectMenuDescription = cva("text-fg/50 block truncate text-xs");

export const selectMenuContent = cva("max-h-72 w-(--radix-dropdown-menu-trigger-width) overflow-y-auto");

export const selectMenuItem = cva("flex flex-col gap-0.5");

export const selectMenuItemLabel = cva("text-sm font-medium");

export const selectMenuItemDescription = cva("text-fg/50 text-xs");
