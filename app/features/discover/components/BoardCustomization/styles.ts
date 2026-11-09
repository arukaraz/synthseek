import { cva } from "class-variance-authority";

export const customizationBody = cva("flex min-h-0 flex-1 flex-col sm:flex-row");

export const customizationNav = cva(
  "border-fg/10 hidden shrink-0 gap-1 sm:flex sm:w-44 sm:flex-col sm:border-r sm:pr-3 sm:pb-4 sm:pl-6"
);

export const customizationTitleRow = cva("flex min-w-0 items-center gap-1.5");

export const customizationTabBar = cva("border-fg/10 grid shrink-0 grid-cols-4 border-t sm:hidden");

export const customizationTabBarTab = cva(
  "focus-visible:ring-primary-400 flex h-15 min-w-0 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset",
  {
    variants: {
      active: {
        true: "text-primary-300 font-semibold",
        false: "text-fg/55 hover:text-fg/80",
      },
    },
  }
);

export const customizationTabBarLabel = cva("max-w-full truncate");

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

export const layoutTabs = cva("px-4 max-sm:pt-1 sm:px-6");

export const settingsTabs = cva("self-end max-sm:hidden");
