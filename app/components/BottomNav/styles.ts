import { cva } from "class-variance-authority";

export const bottomNavContainer = cva(
  "border-fg/5 bg-surface/95 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-2xl sm:hidden"
);

export const bottomNavList = cva("flex items-stretch justify-around px-2 pt-1.5");

export const bottomNavItem = cva(
  "relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      active: {
        true: "text-fg",
        false: "text-fg/55 hover:text-fg/85",
      },
    },
    defaultVariants: { active: false },
  }
);

export const bottomNavLabel = cva("max-w-full truncate");

export const bottomNavUnderline = cva(
  "bg-primary-500 absolute top-0 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full"
);
