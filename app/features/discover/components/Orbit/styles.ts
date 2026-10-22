import { cva } from "class-variance-authority";

export const orbitBody = cva("flex min-h-0 flex-1 flex-col");

export const orbitRail = cva("flex snap-x gap-3 pb-1 [&>*]:w-36 [&>*]:shrink-0 [&>*]:snap-start");

export const orbitCard = cva(
  "focus-visible:ring-primary-400 group/orbit flex min-w-0 flex-col gap-1.5 rounded-xl text-left outline-none focus-visible:ring-2"
);

export const orbitCover = cva(
  "bg-surface-sunken relative aspect-square w-full overflow-hidden rounded-lg transition-transform group-hover/orbit:scale-[1.02]"
);

export const orbitTitle = cva("text-fg truncate text-[13px] font-semibold");

export const orbitArtist = cva("text-fg/60 truncate text-[11.5px]");

export const orbitBecause = cva("text-fg/50 line-clamp-2 text-[11px]");
