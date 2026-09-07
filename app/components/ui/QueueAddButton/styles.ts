import { cva } from "class-variance-authority";

export const queueAddButton = cva(
  "focus-visible:ring-primary-400 grid size-7 shrink-0 place-items-center rounded-full transition-[color,opacity] focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50",
  {
    variants: {
      confirmed: {
        true: "text-primary-400",
        false: "text-fg/45 hover:text-fg",
      },
    },
    defaultVariants: { confirmed: false },
  }
);

export const queueAddReveal = cva("focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100");

export const queueAddGlyph = cva("size-4");
