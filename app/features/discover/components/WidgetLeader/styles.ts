import { cva } from "class-variance-authority";

export const leaderFrame = cva("@container flex min-h-0 flex-1 flex-col");

export const leaderLayout = cva("flex min-h-0 flex-1 flex-col gap-3 @3xl:flex-row @3xl:gap-5");

export const leader = cva(
  "relative flex min-h-52 shrink-0 overflow-hidden rounded-2xl @3xl:min-h-0 @3xl:w-[clamp(14rem,30%,18rem)]"
);

export const leaderCover = cva("absolute inset-0 [&_img]:object-cover");

export const leaderShade = cva(
  "pointer-events-none absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-black/10"
);

export const leaderBadge = cva(
  "text-overlay-fg absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm [&_svg]:size-3"
);

export const leaderBody = cva("relative z-10 mt-auto flex w-full min-w-0 flex-col items-start gap-1 p-4");

export const leaderRank = cva("text-overlay-fg text-4xl leading-none font-black tabular-nums @3xl:text-5xl");

export const leaderTitle = cva("text-overlay-fg w-full truncate text-lg font-semibold");

export const leaderSubtitle = cva("text-overlay-fg/80 mb-2 w-full truncate text-sm");
