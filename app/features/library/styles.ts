import { cva } from "class-variance-authority";

export const libraryScreen = cva("flex h-full min-h-0 flex-col");

export const libraryBody = cva("flex min-h-0 flex-1 gap-4 px-4 pt-4 pb-6 sm:px-6");

export const sidebarColumn = cva("hidden w-64 shrink-0 lg:block");

export const mainColumn = cva("flex min-h-0 min-w-0 flex-1 flex-col gap-4");

export const resultsShell = cva("relative flex min-h-0 flex-1 flex-col");

export const resultsScroll = cva("min-h-0 flex-1 overflow-y-auto transition-opacity", {
  variants: {
    stale: {
      true: "pointer-events-none opacity-40",
      false: "",
    },
  },
  defaultVariants: {
    stale: false,
  },
});

export const resultsOverlay = cva("absolute inset-0 z-10 grid place-items-center");

export const stateWrap = cva("flex min-h-64 flex-1 items-center justify-center");
