import { cva } from "class-variance-authority";

export const splitGroup = cva("inline-flex shrink-0 items-stretch overflow-hidden", {
  variants: {
    tone: {
      primary: "shadow-primary-500/20 shadow-lg",
      ghost: "border-fg/10 border",
    },
    size: {
      sm: "rounded-lg",
      md: "rounded-xl",
      lg: "rounded-xl",
    },
    fullWidth: {
      true: "flex w-full",
      false: "",
    },
    disabled: {
      true: "cursor-not-allowed opacity-50",
      false: "",
    },
  },
  defaultVariants: { tone: "primary", size: "md", fullWidth: false, disabled: false },
});

export const splitDirect = cva(
  "focus-visible:ring-primary-400 inline-flex items-center justify-center gap-2 font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset disabled:pointer-events-none",
  {
    variants: {
      tone: {
        primary:
          "from-primary-600 to-accent-600 text-overlay-fg hover:from-primary-500 hover:to-accent-500 bg-linear-to-r",
        ghost: "bg-fg/5 text-fg hover:bg-primary-500/15",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-11 px-5 text-base",
      },
      iconOnly: {
        true: "px-0",
        false: "",
      },
      fullWidth: {
        true: "flex-1",
        false: "",
      },
    },
    compoundVariants: [
      { iconOnly: true, size: "sm", className: "w-7" },
      { iconOnly: true, size: "md", className: "w-9" },
      { iconOnly: true, size: "lg", className: "w-11" },
    ],
    defaultVariants: { tone: "primary", size: "md", iconOnly: false, fullWidth: false },
  }
);

export const splitCustomize = cva(
  "focus-visible:ring-primary-400 inline-flex items-center justify-center border-l transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset disabled:pointer-events-none",
  {
    variants: {
      tone: {
        primary: "bg-accent-600 border-overlay-fg/30 text-overlay-fg hover:bg-accent-500",
        ghost: "bg-fg/5 border-fg/10 text-fg/80 hover:bg-primary-500/15 hover:text-fg",
      },
      size: {
        sm: "h-7 w-7",
        md: "h-9 w-9",
        lg: "h-11 w-11",
      },
    },
    defaultVariants: { tone: "primary", size: "md" },
  }
);

export const splitIcon = cva("shrink-0", {
  variants: {
    size: {
      sm: "size-3.5",
      md: "size-4",
      lg: "size-4",
    },
  },
  defaultVariants: { size: "md" },
});
