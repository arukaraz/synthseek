import { cva } from "class-variance-authority";

export const editorHeader = cva("flex flex-wrap items-center gap-x-3 gap-y-2");

export const editorTitle = cva("text-fg text-lg font-semibold");

export const docLink = cva(
  "text-fg/60 hover:text-fg focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-sm text-sm outline-none focus-visible:ring-2"
);

export const editorControls = cva("ml-auto flex items-center gap-2");

export const editorBody = cva("flex flex-col gap-4");

export const editorContent = cva("flex flex-col gap-4 **:scroll-mb-24");

export const noteRow = cva("flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2.5 text-sm sm:p-3", {
  variants: {
    tone: {
      info: "border-info-tint/30 bg-info-tint/10 text-info-faint",
      warning: "border-warning-vivid/40 bg-warning-vivid/10 text-fg",
    },
  },
  defaultVariants: { tone: "info" },
});

export const noteText = cva("min-w-0 flex-1 basis-56 break-words");

export const noteActions = cva("flex max-w-full flex-wrap items-center gap-2");

export const noteTitle = cva("font-semibold", {
  variants: { tone: { info: "text-info-pale", warning: "text-fg" } },
  defaultVariants: { tone: "info" },
});

export const menuPanel = cva("flex w-80 max-w-[calc(100vw-1rem)] flex-col gap-3 p-3 text-sm");

export const menuRow = cva("flex items-center justify-between gap-3");

export const menuRowLabel = cva("text-fg/80 flex items-center gap-1.5 text-sm font-medium");

export const menuRowControl = cva("flex shrink-0 items-center gap-2");

export const editorBar = cva(
  "border-primary-500/50 bg-surface-overlay sticky bottom-2.5 z-20 flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 shadow-lg"
);

export const barSeparator = cva("bg-fg/15 h-5 w-px shrink-0 max-sm:hidden");

export const barStatus = cva("text-fg/70 min-w-32 flex-1 text-xs max-sm:order-first max-sm:basis-full sm:text-sm");

export const barPreview = cva("max-sm:ml-auto");

export const outlineButton = cva("border-fg/15 border");
