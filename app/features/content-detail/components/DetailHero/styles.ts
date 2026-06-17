import { cva } from "class-variance-authority";

export const heroBackdrop = cva(
  "pointer-events-none absolute -top-10 -right-10 -bottom-16 -left-10 -z-10 overflow-hidden sm:-top-[60px] sm:-right-[60px] sm:-left-[60px]"
);

export const heroBackdropImage = cva(
  "scale-110 object-cover opacity-30 blur-2xl [mask-image:linear-gradient(to_bottom,#000_0%,#000_30%,transparent_82%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_0%,#000_30%,transparent_82%)]"
);

export const heroBackdropVeil = cva(
  "from-surface/40 via-surface/10 absolute inset-0 bg-gradient-to-b to-transparent via-55%"
);

export const avatarWrap = cva("relative shrink-0");

export const shareFanRoot = cva("absolute inset-0 hidden sm:block");

export const shareFab = cva(
  "border-fg/10 from-primary-600 to-accent-600 text-fg absolute right-0 bottom-0 z-20 grid size-8 place-items-center rounded-full border bg-gradient-to-br shadow-lg transition-transform",
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
