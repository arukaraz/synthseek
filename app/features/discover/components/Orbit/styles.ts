import { cva } from "class-variance-authority";

export const orbitBody = cva("flex min-h-0 flex-1 flex-col [container-type:size]");

export const orbitRail = cva(
  "grid w-max min-h-0 auto-cols-[clamp(9rem,calc(100cqh-4.75rem),16rem)] grid-flow-col grid-rows-[minmax(0,1fr)_auto_auto_auto] gap-x-3 gap-y-1 snap-x pb-1 [&>*]:snap-start"
);

export const orbitGrid = cva(
  "grid min-h-0 flex-1 grid-rows-[minmax(0,9rem)_auto_auto_auto] content-start gap-x-3 gap-y-1 [grid-template-columns:repeat(var(--card-cols),minmax(0,1fr))]"
);

export const orbitCard = cva(
  "group/card relative row-span-4 grid min-w-0 grid-rows-subgrid gap-y-1 rounded-xl text-left"
);

export const orbitCover = cva(
  "bg-surface-sunken relative h-full min-h-0 w-full overflow-hidden rounded-lg transition-transform group-hover/card:scale-[1.02]"
);

export const orbitOpen = cva(
  "focus-visible:ring-primary-400 min-w-0 rounded-sm text-left outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:after:ring-2"
);

export const orbitTitle = cva("text-fg block truncate text-[13px] font-semibold");

export const orbitArtist = cva("text-fg/60 truncate text-[11.5px]");

export const orbitBecause = cva("text-fg/50 truncate text-[11px]");
