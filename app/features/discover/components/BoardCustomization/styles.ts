import { cva } from "class-variance-authority";

export const customizationBody = cva("flex min-h-0 flex-1 flex-col sm:flex-row");

export const customizationNav = cva(
  "border-fg/10 flex shrink-0 gap-1 overflow-x-auto px-4 pb-3 sm:w-44 sm:flex-col sm:overflow-visible sm:border-r sm:pr-3 sm:pb-4 sm:pl-6"
);

export const customizationNavTab = cva(
  "focus-visible:ring-primary-400 flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-2",
  {
    variants: {
      active: {
        true: "bg-primary-500/15 text-fg",
        false: "text-fg/60 hover:bg-fg/5 hover:text-fg/85",
      },
    },
  }
);

export const customizationPanel = cva("flex min-h-0 min-w-0 flex-1 flex-col");

export const layoutTabs = cva("px-4 sm:px-6");

export const settingsTabs = cva("self-end");
