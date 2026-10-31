import type { CssVars } from "@theme/utilities/types";
import { cva } from "class-variance-authority";

export const setHiddenLine = cva("text-fg/60 mt-2 truncate text-xs");

export const visuallyHidden = cva("sr-only");

export const blockBody = cva("@container flex min-h-0 flex-1 flex-col");

export const blockList = cva("flex flex-col gap-0.5", {
  variants: {
    wide: {
      true: "@3xl:grid @3xl:grid-cols-2 @3xl:gap-x-6",
      false: "",
    },
  },
  defaultVariants: { wide: false },
});

export const blockValue = cva(
  "inline-flex shrink-0 items-center rounded-full bg-fg/10 px-2 py-0.5 font-sans text-[10.5px] font-semibold whitespace-nowrap text-[var(--mix-acc)]"
);

export const blockRail = cva("flex h-full snap-x gap-3 [&>*]:w-32 [&>*]:shrink-0 [&>*]:snap-start");

export const card = cva("group/card flex min-h-0 min-w-0", {
  variants: {
    surface: {
      framed: "border-fg/10 bg-surface/40 hover:border-fg/20 overflow-hidden rounded-xl border transition-colors",
      bare: "flex-col gap-2",
    },
    single: {
      true: "flex-col",
      false: "",
    },
  },
  defaultVariants: { surface: "bare", single: false },
});

export const cardCover = cva("bg-surface-sunken relative overflow-hidden [&_img]:object-cover", {
  variants: {
    surface: {
      framed: "",
      bare: "aspect-square w-full shrink rounded-xl",
    },
    single: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    { surface: "framed", single: true, className: "min-h-0 w-full flex-1" },
    {
      surface: "framed",
      single: false,
      className:
        "aspect-square h-full max-w-[45%] shrink-0 [&>button]:right-1 [&>button]:bottom-1 [&>button]:size-7 [&>button_svg]:size-3.5",
    },
  ],
  defaultVariants: { surface: "bare", single: false },
});

export const cardAction = cva(
  "text-overlay-fg focus-visible:ring-primary-400 absolute right-2 bottom-2 z-10 flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/55 opacity-0 backdrop-blur-sm transition outline-none group-hover/card:opacity-100 hover:bg-[var(--mix-acc)] focus-visible:opacity-100 focus-visible:ring-2 [@media(hover:none)]:opacity-100 [&_svg]:size-4 [&_svg]:fill-current"
);

export const cardCopy = cva("flex min-w-0 flex-col", {
  variants: {
    surface: {
      framed: "shrink-0 p-2.5",
      bare: "",
    },
    single: {
      true: "items-center text-center",
      false: "",
    },
  },
  compoundVariants: [{ surface: "framed", single: false, className: "min-w-0 flex-1 shrink justify-center" }],
  defaultVariants: { surface: "bare", single: false },
});

export const cardTitle = cva("text-fg max-w-full truncate text-[13px] font-medium", {
  variants: {
    interactive: {
      true: "hover:underline focus-visible:underline outline-none",
      false: "",
    },
    single: {
      true: "text-center text-sm",
      false: "text-left",
    },
  },
  defaultVariants: { interactive: false, single: false },
});

export const cardSubtitle = cva("text-fg/60 max-w-full truncate", {
  variants: {
    single: {
      true: "text-xs",
      false: "text-[11.5px]",
    },
  },
  defaultVariants: { single: false },
});

export const postersGrid = cva(
  "grid min-h-0 flex-1 auto-rows-fr gap-3 [grid-template-columns:repeat(var(--card-cols),minmax(0,1fr))]"
);

export const framelessBlock = cva("flex min-h-0 min-w-0 flex-1 [&>*]:min-h-0 [&>*]:size-full");

export const spotlightTile = cva(
  "group/card relative min-h-0 overflow-hidden rounded-xl transition-transform hover:-translate-y-0.5"
);

export const spotlightShade = cva(
  "pointer-events-none absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent"
);

export const spotlightCopy = cva("absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-3 pr-12");

export const spotlightTitle = cva("text-overlay-fg truncate text-left text-sm font-bold sm:text-base", {
  variants: {
    interactive: {
      true: "outline-none after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:underline",
      false: "",
    },
  },
  defaultVariants: { interactive: false },
});

export const spotlightMeta = cva("text-overlay-fg-muted truncate text-xs");

export const tileCard = cva(
  "group/card relative h-full min-h-0 overflow-hidden rounded-lg transition-transform hover:-translate-y-0.5"
);

export const tileShade = cva(
  "pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent"
);

export const tileCopy = cva("absolute inset-x-0 bottom-0 flex flex-col p-3 pr-12");

export const tileName = cva("text-overlay-fg truncate text-left font-bold", {
  variants: {
    size: {
      small: "text-sm",
      medium: "text-base",
      large: "text-lg",
    },
    interactive: {
      true: "outline-none after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:underline",
      false: "",
    },
  },
  defaultVariants: { size: "small", interactive: false },
});

export const tileValue = cva("text-overlay-fg-muted truncate text-xs");

export const heroCover = cva("absolute inset-0 overflow-hidden rounded-2xl [&_img]:object-cover");

export const heroBadge = cva(
  "text-fg relative flex items-center gap-2 p-5 font-mono text-xs tracking-[0.2em] uppercase sm:p-6 [&_svg]:size-3"
);

export const cardFoot = cva("truncate text-[11px] font-semibold text-[var(--mix-acc)]");

export const statBody = cva("flex min-h-0 flex-1 items-end justify-between gap-4");

export const statValue = cva("text-fg text-4xl leading-none font-black tabular-nums @xl:text-5xl");

export const statLabel = cva("text-fg/60 truncate text-xs");

export const statDelta = cva("truncate text-[11px] font-semibold text-[var(--mix-acc)]");

export const statsRow = cva("grid min-h-0 flex-1 gap-4 [grid-template-columns:repeat(var(--stat-cols),minmax(0,1fr))]");

export function statsVars(columns: number): CssVars {
  return { "--stat-cols": String(columns) };
}

export const statCell = cva("flex min-w-0 flex-col justify-start gap-1");

export const statsValue = cva("text-fg text-2xl leading-none font-bold tabular-nums");

export const leaderLink = cva(
  "text-overlay-fg w-full truncate text-left text-lg font-semibold outline-none hover:underline focus-visible:underline"
);

export const leaderAction = cva(
  "text-overlay-fg inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-3 py-1 text-xs font-semibold backdrop-blur-sm hover:bg-[var(--mix-acc)] [&_svg]:size-3.5"
);

export const feedList = cva("flex flex-col divide-y divide-fg/10");

export const feedItem = cva("flex min-w-0 flex-col gap-0.5 py-2 first:pt-0");

export const feedTitle = cva("text-fg line-clamp-2 text-left text-[13px] font-semibold", {
  variants: {
    interactive: {
      true: "hover:underline focus-visible:underline outline-none",
      false: "",
    },
  },
  defaultVariants: { interactive: false },
});

export const feedMeta = cva("text-fg/60 truncate text-[11.5px]");

export const calendarDate = cva(
  "flex w-10 shrink-0 flex-col items-center rounded-lg bg-fg/10 py-1 leading-none text-[var(--mix-acc)]"
);

export const calendarMonth = cva("text-[9.5px] font-bold uppercase tracking-wider");

export const calendarDay = cva("text-fg text-base font-bold tabular-nums");

export const moveBadge = cva(
  "inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[10.5px] font-semibold whitespace-nowrap [&_svg]:size-3",
  {
    variants: {
      direction: {
        up: "bg-fg/10 text-[var(--mix-acc)]",
        down: "bg-fg/5 text-fg/60",
        same: "bg-fg/5 text-fg/50",
        new: "bg-fg/10 text-fg",
      },
    },
    defaultVariants: { direction: "same" },
  }
);

export const mosaicGrid = cva(
  "grid min-h-0 flex-1 gap-2 [grid-template-columns:repeat(var(--mosaic-cols),minmax(0,1fr))] [grid-template-rows:repeat(var(--mosaic-rows),minmax(0,1fr))] @max-md:[grid-template-columns:repeat(3,minmax(0,1fr))] @max-md:[&>li:nth-child(n+7)]:hidden"
);

export const mosaicTile = cva("bg-surface-sunken relative min-h-0 overflow-hidden rounded-lg [&_img]:object-cover");

export const mosaicButton = cva(
  "text-overlay-fg focus-visible:ring-primary-400 absolute inset-0 flex items-center justify-center rounded-lg opacity-0 outline-none transition hover:bg-black/45 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-inset [@media(hover:none)]:opacity-100 [&_svg]:size-5 [&_svg]:fill-current"
);

export function mosaicVars(columns: number, rows: number): CssVars {
  return { "--mosaic-cols": String(columns), "--mosaic-rows": String(rows) };
}
