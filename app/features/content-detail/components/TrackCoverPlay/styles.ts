import { cva } from "class-variance-authority";

export const coverPlay = cva("bg-fg/10 relative block size-9 shrink-0 overflow-hidden rounded-md", {
  variants: {
    pressable: {
      true: "group/cover focus-visible:ring-primary-400 cursor-pointer outline-none focus-visible:ring-2 disabled:cursor-default",
      false: "",
    },
  },
  defaultVariants: { pressable: false },
});

export const coverPlayImage = cva("h-full w-full object-cover");

export const coverPlayInitials = cva("text-fg/60 grid h-full w-full place-items-center text-11 font-bold");

export const coverPlayVeil = cva(
  "text-overlay-fg absolute inset-0 grid place-items-center bg-veil/65 opacity-0 transition-opacity group-hover/cover:opacity-100 group-focus-visible/cover:opacity-100 a11y-mode:opacity-100"
);

export const coverPlayBars = cva(
  "text-overlay-fg absolute inset-0 grid place-items-center bg-veil/65 transition-opacity group-hover/cover:opacity-0 group-focus-visible/cover:opacity-0 a11y-mode:opacity-0"
);
