import { cva } from "class-variance-authority";

export const themeGrid = cva("grid grid-cols-2 gap-3 sm:flex sm:flex-wrap");

export const themeCard = cva(
  "group focus-visible:ring-ring relative flex min-w-0 flex-1 basis-40 cursor-pointer flex-col overflow-hidden rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100",
  {
    variants: {
      selected: {
        true: "border-primary-500/60 bg-primary-500/10 hover:bg-primary-500/15",
        false: "border-fg/10 hover:border-fg/20 hover:bg-fg/[0.03]",
      },
      featured: {
        true: "col-span-2 sm:col-span-1",
        false: "",
      },
    },
    defaultVariants: { selected: false, featured: false },
  }
);

export const themeCardPreview = cva("relative aspect-[16/10] w-full overflow-hidden");

export const themeCardFooter = cva("border-fg/10 flex items-center gap-2.5 border-t px-3 py-2.5");

export const themeCardIndicator = cva(
  "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors motion-reduce:transition-none",
  {
    variants: {
      selected: {
        true: "border-primary-500 bg-primary-500 text-primary-foreground",
        false: "border-fg/30 bg-transparent",
      },
    },
    defaultVariants: { selected: false },
  }
);

export const themeCardIndicatorCheck = cva("size-3");

export const themeCardLabelGroup = cva("flex min-w-0 flex-col");

export const themeCardLabel = cva("text-fg truncate text-sm", {
  variants: {
    selected: {
      true: "font-semibold",
      false: "font-medium",
    },
  },
  defaultVariants: { selected: false },
});

export const themeCardHint = cva("text-fg/50 truncate text-[11px]");

export const themePreviewWindow = cva("bg-surface-sunken absolute inset-0 flex");

export const themePreviewRail = cva("bg-glass border-glass-border flex h-full w-1/4 flex-col gap-1 border-r p-1.5");

export const themePreviewRailDot = cva("bg-fg/25 size-1.5 rounded-full");

export const themePreviewBody = cva("flex flex-1 flex-col gap-1.5 p-2");

export const themePreviewBar = cva("rounded-full", {
  variants: {
    strength: {
      strong: "bg-fg/40",
      medium: "bg-fg/25",
      faint: "bg-fg/15",
    },
    width: {
      full: "w-full",
      wide: "w-4/5",
      narrow: "w-3/5",
    },
  },
  defaultVariants: { strength: "medium", width: "full" },
});

export const themePreviewBarRow = cva("flex flex-col gap-1.5");

export const themePreviewChip = cva("bg-primary-500 mt-auto h-2.5 w-1/3 rounded-full");

export const apiKeyRow = cva(
  "border-fg/10 flex items-start justify-between gap-3 border-b py-3.5 first:pt-0 last:border-b-0 last:pb-0"
);

export const apiKeyInfo = cva("flex min-w-[3ch] flex-1 flex-col gap-0.5");

export const apiKeyName = cva("text-fg break-words text-sm font-medium");

export const apiKeyMeta = cva("text-fg/50 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs");

export const apiKeyMetaSeparator = cva("text-fg/30");

export const tokenBox = cva("bg-fg/5 ring-fg/10 text-fg block break-all rounded-lg p-3 font-mono text-xs ring-1");

export const connectList = cva("flex flex-col gap-2");

export const connectLabel = cva("text-fg font-semibold");
