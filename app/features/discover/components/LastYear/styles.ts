import { cva } from "class-variance-authority";

export const weekBody = cva("@container flex min-h-0 flex-1 flex-col");

export const weekLayout = cva(
  "flex min-h-0 flex-1 flex-col gap-3 @3xl:grid @3xl:grid-cols-[13rem_minmax(0,1fr)] @3xl:gap-5"
);

export const weekStats = cva("grid shrink-0 grid-cols-3 gap-2 @3xl:grid-cols-1 @3xl:content-start");

export const weekStat = cva("bg-fg/[0.04] flex min-w-0 flex-col rounded-xl px-3 py-2");

export const weekStatValue = cva("text-fg truncate text-base font-semibold");

export const weekStatLabel = cva("text-fg/50 text-[11px]");

export const weekSkeleton = cva("bg-fg/5 h-12 shrink-0 animate-pulse rounded-lg");
