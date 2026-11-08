import { cva } from "class-variance-authority";

export const libraryScreen = cva("flex h-full min-h-0 flex-col");

export const libraryToolbarRow = cva("px-4 pt-4 max-sm:hidden sm:px-6");

export const libraryBody = cva("flex min-h-0 flex-1 gap-4 px-4 pt-0 pb-0 sm:px-6 sm:pt-4 sm:pb-6");

export const sidebarColumn = cva("hidden w-64 shrink-0 lg:block");

export const mainColumn = cva("flex min-h-0 min-w-0 flex-1 flex-col gap-4");

export const resultsShell = cva("relative flex min-h-0 flex-1 flex-col");

export const resultsScroll = cva("min-h-0 flex-1 overflow-y-auto transition-opacity", {
  variants: {
    stale: {
      true: "pointer-events-none opacity-40",
      false: "",
    },
    indexed: {
      true: "max-sm:pr-7 max-sm:[scrollbar-width:none] max-sm:[&::-webkit-scrollbar]:hidden",
      false: "",
    },
  },
  defaultVariants: {
    stale: false,
    indexed: false,
  },
});

export const pagerWrap = cva("max-sm:pb-4");

export const resultsOverlay = cva("absolute inset-0 z-10 grid place-items-center");

export const stateWrap = cva("flex min-h-64 flex-1 items-center justify-center");

export const libraryMenuItem = cva("text-fg/80 focus:bg-fg/5 focus:text-fg gap-2.5 py-2");

export const libraryMenuItemDanger = cva(
  "text-destructive-vivid hover:bg-destructive-vivid/10 hover:text-destructive-vivid focus:bg-destructive-vivid/10 focus:text-destructive-vivid active:bg-destructive-vivid/15 gap-2.5 py-2"
);
