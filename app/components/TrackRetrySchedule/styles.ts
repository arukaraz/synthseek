import { cva } from "class-variance-authority";

export const scheduleRow = cva("text-fg/50 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]");

export const scheduleFact = cva("inline-flex min-w-0 items-center gap-1");

export const retryNowButton = cva("text-primary-400 inline-flex items-center gap-1 underline-offset-2 hover:underline");
