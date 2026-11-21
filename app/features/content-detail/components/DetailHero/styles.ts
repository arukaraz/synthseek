import { cva } from "class-variance-authority";

export const heroBackdrop = cva(
  "pointer-events-none absolute -top-10 -right-10 -bottom-16 -left-10 -z-10 overflow-hidden sm:-top-15 sm:-right-15 sm:-left-15"
);

export const heroBackdropImage = cva(
  "scale-110 object-cover opacity-30 blur-2xl [mask-image:linear-gradient(to_bottom,#000_0%,#000_30%,transparent_82%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_0%,#000_30%,transparent_82%)]"
);

export const heroBackdropVeil = cva(
  "from-surface/40 via-surface/10 absolute inset-0 bg-linear-to-b to-transparent via-55%"
);

export const avatarWrap = cva("relative shrink-0");

export const shareFanRoot = cva("absolute inset-0 hidden sm:block");

export const shareFab = cva(
  "border-fg/10 from-primary-600 to-accent-600 text-overlay-fg absolute right-0 bottom-0 z-20 grid size-8 place-items-center rounded-full border bg-linear-to-br shadow-lg transition-transform",
  {
    variants: {
      open: {
        true: "rotate-[135deg]",
        false: "rotate-0",
      },
    },
    defaultVariants: { open: false },
  }
);

export const shareItem = cva(
  "bg-surface/90 absolute top-1/2 left-1/2 z-10 grid size-9 place-items-center rounded-full shadow-md backdrop-blur"
);

export const shareIcon = cva("size-4");

export const heroSocials = cva("mt-4 flex items-center justify-center gap-3 sm:hidden");

export const heroSocialLink = cva(
  "border-fg/10 bg-fg/5 hover:bg-fg/10 grid size-9 place-items-center rounded-full border transition-colors"
);

export const genreOverflowChip = cva(
  "border-fg/10 bg-fg/5 text-fg/70 rounded-full border px-3 py-1 text-xs font-medium tabular-nums"
);

export const heroMenuItem = cva("text-fg/80 focus:bg-fg/5 focus:text-fg gap-2.5 py-2");

export const heroActionsSpacer = cva("flex-1 max-sm:hidden");

export const heroToolGroup = cva("border-fg/15 inline-flex shrink-0 items-stretch overflow-hidden rounded-md border");

export const heroToolButton = cva(
  "text-fg/70 hover:bg-fg/5 hover:text-fg focus-visible:ring-primary-400 border-fg/15 grid size-9 shrink-0 place-items-center transition-colors outline-none not-first:border-l focus-visible:ring-2 focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50"
);

export const playSplit = cva("inline-flex h-11 shrink-0 items-stretch overflow-hidden rounded-full", {
  variants: {
    mode: {
      artist: "type-text-artist",
      album: "type-text-album",
      playlist: "type-text-playlist",
    },
  },
});

export const playSplitMain = cva(
  "focus-visible:ring-fg inline-flex items-center bg-current pl-4 text-sm font-semibold transition-[filter] outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-inset disabled:opacity-60 sm:pl-5 sm:text-base",
  {
    variants: {
      alone: {
        true: "pr-4 sm:pr-5",
        false: "pr-3 sm:pr-4",
      },
    },
    defaultVariants: { alone: false },
  }
);

export const playSplitMore = cva(
  "focus-visible:ring-fg border-surface/30 inline-flex w-9 items-center justify-center border-l bg-current transition-[filter] outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-inset disabled:opacity-60 sm:w-10"
);

export const playSplitInk = cva("text-surface inline-flex items-center gap-2");

export const playSplitLabel = cva("max-[374px]:hidden");

export const playSplitOption = cva("flex min-w-0 flex-col");

export const playSplitHint = cva("text-fg/50 max-w-56 text-xs font-normal");

export const heroBadgeRow = cva("flex flex-wrap items-center justify-center gap-2 sm:justify-start");

export const heroBadgeDivider = cva("bg-fg/15 h-4 w-px shrink-0");

export const heroSyncToggle = cva("flex shrink-0 items-center gap-1.5");

export const heroSyncToggleIcon = cva(
  "size-4 transition-[transform,color] duration-[850ms] ease-in-out motion-reduce:transition-colors",
  {
    variants: {
      active: {
        true: "text-primary-400",
        false: "text-fg/50",
      },
    },
    defaultVariants: { active: false },
  }
);
