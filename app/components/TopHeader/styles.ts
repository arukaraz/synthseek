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

export const headerContent = cva("relative flex w-full items-center gap-3 px-4 sm:gap-6 sm:px-6", {
  variants: {
    height: {
      default: "h-16 sm:h-20",
    },
  },
  defaultVariants: {
    height: "default",
  },
});

export type HeaderContentProps = VariantProps<typeof headerContent>;

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

export const headerTab = cva(
  "relative h-9 items-center gap-2 rounded-md px-3 text-sm transition-colors [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      active: {
        true: "text-fg",
        false: "text-fg/55 hover:text-fg/85 hover:bg-fg/5",
      },
      mobile: {
        show: "flex",
        hide: "hidden sm:flex",
      },
    },
    defaultVariants: { active: false, mobile: "show" },
  }
);

export const headerTabLabel = cva("font-medium", {
  variants: {
    mobile: {
      show: "inline",
      hide: "hidden md:inline",
    },
  },
  defaultVariants: { mobile: "hide" },
});

export const headerTabUnderline = cva("absolute -bottom-[3px] left-3 right-3 h-[2px] rounded-full bg-primary-500");

export const headerTabBadge = cva(
  "ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-500/20 px-1.5 text-[10px] font-semibold text-accent-200"
);

export const searchForm = cva("mx-auto flex w-full min-w-0 max-w-md flex-1 sm:block sm:max-w-lg lg:max-w-xl");

export const searchShell = cva("relative flex w-full min-w-0 items-center rounded-xl border transition-all", {
  variants: {
    focused: {
      true: "border-primary-500/50 bg-primary-500/5 shadow-primary-500/20 shadow-lg",
      false: "border-fg/10 bg-fg/5",
    },
  },
  defaultVariants: { focused: false },
});

export const searchInput = cva(
  "text-fg placeholder-fg/35 h-10 w-full min-w-0 bg-transparent pr-4 pl-10 text-sm outline-none sm:pr-20"
);
