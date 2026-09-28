import { cva } from "class-variance-authority";

export const queueAddButton = cva(
  "group/queue focus-visible:ring-primary-400 grid size-7 shrink-0 place-items-center rounded-full transition-[color,opacity] focus-visible:ring-2 focus-visible:outline-none aria-busy:opacity-50",
  {
    variants: {
      queued: {
        true: "text-primary-400 hover:text-fg",
        false: "text-fg/45 hover:text-fg",
      },
    },
    defaultVariants: { queued: false },
  }
);

export const queueAddReveal = cva("focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100");

export const queueAddGlyph = cva("size-4");

export const queuedGlyph = cva("size-4", {
  variants: {
    settling: {
      true: "",
      false: "group-hover/queue:hidden group-focus-visible/queue:hidden",
    },
  },
  defaultVariants: { settling: false },
});

export const queueRemoveGlyph = cva("hidden size-4", {
  variants: {
    settling: {
      true: "",
      false: "group-hover/queue:block group-focus-visible/queue:block",
    },
  },
  defaultVariants: { settling: false },
});

export const queueCurrentSlot = cva("text-primary-400 grid size-7 shrink-0 place-items-center");
