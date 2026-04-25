import { cva } from "class-variance-authority";

export const modalContent = cva("flex h-[min(80vh,720px)] max-h-[90vh] w-full max-w-4xl gap-0 overflow-hidden p-0");

export const layoutRoot = cva("flex h-full w-full flex-row");

export const sidebar = cva(
  "border-fg/10 bg-surface/30 flex w-60 shrink-0 flex-col gap-0.5 overflow-y-auto border-r p-3"
);

export const sidebarGroupButton = cva(
  "text-fg/80 hover:bg-fg/5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      active: {
        true: "bg-fg/10 text-fg",
        false: "",
      },
    },
    defaultVariants: { active: false },
  }
);

export const sidebarGroupLabel = cva("flex-1 truncate text-left");

export const sidebarItem = cva(
  "text-fg/60 hover:bg-fg/5 hover:text-fg/90 flex w-full items-center gap-2 rounded-lg py-1.5 pr-3 pl-9 text-sm transition-colors",
  {
    variants: {
      active: {
        true: "bg-primary-500/10 text-fg font-medium",
        false: "",
      },
    },
    defaultVariants: { active: false },
  }
);

export const contentRoot = cva("flex flex-1 flex-col gap-6 overflow-y-auto p-6");

export const sectionTitle = cva("text-fg text-lg font-semibold");

export const sectionSubtitle = cva("text-fg/60 text-sm");

export const emptyPanel = cva(
  "border-fg/10 bg-fg/5 flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center"
);
