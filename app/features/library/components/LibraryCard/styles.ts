import { cva } from "class-variance-authority";

export const cardGrid = cva(
  "grid grid-cols-2 gap-x-3 gap-y-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
  {
    variants: {
      density: {
        comfortable: "",
        compact: "max-sm:grid-cols-3 max-sm:gap-x-2.5 max-sm:gap-y-3",
        list: "max-sm:grid-cols-1 max-sm:gap-y-0",
      },
    },
    defaultVariants: { density: "comfortable" },
  }
);

export const cardRoot = cva(
  "group flex min-w-0 flex-col gap-2 max-sm:select-none max-sm:[-webkit-touch-callout:none]",
  {
    variants: {
      interactive: {
        true: "focus-visible:ring-primary-500/60 cursor-pointer rounded-lg outline-none focus-visible:ring-2",
        false: "",
      },
    },
    defaultVariants: { interactive: false },
  }
);

export const cardCover = cva(
  "from-primary-500/20 to-accent-500/20 relative aspect-square w-full overflow-hidden rounded-lg bg-linear-to-br",
  {
    variants: {
      tone: {
        none: "ring-fg/10 ring-1",
        selected: "ring-primary-500 ring-2",
        select: "ring-primary-400/60 ring-2",
        clear: "ring-fg/40 ring-2",
      },
    },
    defaultVariants: { tone: "none" },
  }
);

export const cardSelectBox = cva(
  "absolute top-1.5 right-1.5 z-2 grid size-7 place-items-center rounded-md bg-black/55 backdrop-blur-sm transition-opacity",
  {
    variants: {
      shown: {
        true: "opacity-100",
        false: "focus-within:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:pointer-coarse:opacity-100",
      },
    },
    defaultVariants: { shown: false },
  }
);

export const cardSelectCheckbox = cva("border-overlay-fg");

export const cardImage = cva("h-full w-full object-cover");

export const cardInitials = cva("text-fg/70 flex h-full w-full items-center justify-center text-2xl font-bold");

export const cardMosaic = cva("grid h-full w-full grid-cols-2 grid-rows-2");

export const cardMosaicTile = cva("relative h-full w-full overflow-hidden");

export const cardStatusBadge = cva(
  "absolute top-1.5 left-1.5 z-2 inline-flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white backdrop-blur-sm"
);

export const cardStatusDot = cva("size-1.5 shrink-0 rounded-full");

export const cardCoverActions = cva(
  "pointer-events-none absolute inset-0 z-1 grid grid-flow-col place-content-center gap-2 transition-opacity focus-within:opacity-100 has-data-[state=open]:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
);

export const cardCoverScrim = cva("absolute inset-0 -z-1 bg-black/45");

export const cardCoverAction = cva(
  "focus-visible:ring-primary-400 bg-primary-500 text-primary-foreground pointer-events-auto grid size-10 place-items-center rounded-full backdrop-blur-sm transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
);

export const cardPlayButton = cva(
  "focus-visible:ring-primary-400 grid size-9 shrink-0 place-items-center rounded-full transition-transform active:scale-95 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60",
  {
    variants: {
      placement: {
        corner: "bg-primary-500 text-primary-foreground absolute right-2 bottom-2 z-1 shadow-lg",
        inline: "text-primary-400 hover:bg-fg/10",
      },
    },
    defaultVariants: { placement: "corner" },
  }
);

export const cardInlineKebab = cva(
  "text-fg/60 hover:text-fg hover:bg-fg/10 focus-visible:ring-primary-400 grid size-8 shrink-0 place-items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
);

export const cardBodyRow = cva("flex min-w-0 items-start gap-1");

export const cardBody = cva("flex min-w-0 flex-1 flex-col gap-0.5 px-0.5");

export const listRow = cva(
  "focus-visible:ring-primary-500/60 flex min-w-0 cursor-pointer items-center gap-3 rounded-lg py-1.5 outline-none focus-visible:ring-2 max-sm:select-none max-sm:[-webkit-touch-callout:none]",
  {
    variants: {
      selected: { true: "bg-primary-500/12", false: "" },
    },
    defaultVariants: { selected: false },
  }
);

export const listRowArt = cva(
  "from-primary-500/20 to-accent-500/20 ring-fg/10 relative size-14 shrink-0 overflow-hidden bg-linear-to-br ring-1",
  {
    variants: {
      round: { true: "rounded-full", false: "rounded-md" },
    },
    defaultVariants: { round: false },
  }
);

export const listRowText = cva("flex min-w-0 flex-1 flex-col gap-0.5");

export const listRowTitle = cva("text-fg truncate text-[15px] font-semibold");

export const listRowSubtitle = cva("text-fg/60 truncate text-[13px]");

export const listRowCheck = cva("pointer-events-none shrink-0");

export const cardTitle = cva("text-fg truncate text-sm font-semibold");

export const cardSubtitle = cva("text-fg/60 truncate text-xs");

export const cardMeta = cva("text-fg/45 truncate text-[11px]");
