import { cva } from "class-variance-authority";

export const weekBody = cva("@container flex min-h-0 flex-1 flex-col");

export const weekLayout = cva(
  "flex min-h-0 flex-1 flex-col gap-3 @3xl:grid @3xl:grid-cols-[13rem_minmax(0,1fr)] @3xl:gap-5"
);

export const weekStats = cva("grid shrink-0 grid-cols-3 gap-2 @3xl:grid-cols-1 @3xl:content-start");

export const weekStat = cva("bg-fg/[0.04] flex min-w-0 flex-col rounded-xl px-3 py-2");

export const weekStatValue = cva("text-fg truncate text-base font-semibold");

export const weekStatLabel = cva("text-fg/50 text-[11px]");

export const weekList = cva(
  "flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
);

export const weekRow = cva(
  "grid grid-cols-[1.25rem_2.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-1.5 py-1.5"
);

export const weekRank = cva("text-fg/40 text-right font-mono text-[12px]");

export const weekCover = cva("bg-surface-sunken relative size-10 overflow-hidden rounded-md");

export const weekCopy = cva("flex min-w-0 flex-col");

export const weekTitle = cva("text-fg truncate text-[13px] font-medium");

export const weekArtist = cva("text-fg/60 truncate text-[11.5px]");

export const weekPlays = cva("text-fg/50 font-mono text-[11px]");

export const weekSkeleton = cva("bg-fg/5 h-12 shrink-0 animate-pulse rounded-lg");
