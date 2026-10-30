import { cva } from "class-variance-authority";

export const actionBar = cva(
  "flex w-full min-w-0 flex-col items-stretch gap-3 border-t border-fg/10 bg-surface/60 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:flex-wrap sm:items-center sm:pb-3"
);

export const actionBarStart = cva("flex min-w-0 flex-wrap items-center gap-3");

export const actionBarEnd = cva(
  "flex min-w-0 flex-col items-stretch gap-3 sm:ml-auto sm:flex-row sm:flex-wrap sm:items-center"
);

export const actionBarButtons = cva("flex min-w-0 items-center gap-3");

export const actionBarButton = cva("flex-1 sm:flex-none");

export const modalChoice = cva("flex min-w-0 cursor-pointer items-center gap-2 text-xs text-fg/80");
