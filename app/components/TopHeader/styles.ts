import { cva, type VariantProps } from "class-variance-authority";

export const headerContainer = cva("sticky top-0 z-50 w-full border-b border-fg/5", {
  variants: {
    blur: {
      none: "bg-surface/80",
      responsive: "bg-surface/80 sm:bg-surface/40 sm:backdrop-blur-2xl",
    },
  },
  defaultVariants: {
    blur: "responsive",
  },
});

export type HeaderContainerProps = VariantProps<typeof headerContainer>;

export const decorativeLine = cva(
  "decorative-animation absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent",
  {
    variants: {
      color: {
        primary: "via-primary-500",
      },
    },
    defaultVariants: {
      color: "primary",
    },
  }
);

export type DecorativeLineProps = VariantProps<typeof decorativeLine>;

export const headerContent = cva("relative flex w-full items-center justify-between px-4", {
  variants: {
    height: {
      default: "h-16 sm:h-20",
    },
    padding: {
      responsive: "sm:px-6",
    },
  },
  defaultVariants: {
    height: "default",
    padding: "responsive",
  },
});

export type HeaderContentProps = VariantProps<typeof headerContent>;

export const searchInput = cva(
  "text-fg placeholder-fg/30 w-full rounded-xl bg-transparent py-2.5 pr-8 pl-10 text-sm outline-none",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type SearchInputProps = VariantProps<typeof searchInput>;

export const searchGlow = cva(
  "absolute -inset-0.5 -z-10 hidden rounded-xl bg-gradient-to-r opacity-20 blur-sm sm:block",
  {
    variants: {
      color: {
        primary: "from-primary-600 via-accent-600 to-primary-600",
      },
    },
    defaultVariants: {
      color: "primary",
    },
  }
);

export type SearchGlowProps = VariantProps<typeof searchGlow>;

export const clearButton = cva(
  "text-fg/40 hover:bg-fg/10 hover:text-fg absolute right-2.5 rounded p-1 transition-colors",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type ClearButtonProps = VariantProps<typeof clearButton>;
