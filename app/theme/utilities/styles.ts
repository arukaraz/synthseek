import { cva, type VariantProps } from "class-variance-authority";

export const gradientOverlay = cva("pointer-events-none absolute inset-0", {
  variants: {
    direction: {
      toR: "bg-linear-to-r",
      toBr: "bg-linear-to-br",
      toBl: "bg-linear-to-bl",
      toT: "bg-linear-to-t",
      toB: "bg-linear-to-b",
    },
    intensity: {
      subtle: "from-primary-600/5 via-transparent to-primary-500/10",
      medium: "from-primary-500/20 to-accent-500/20",
      accent: "from-accent-600/5 via-transparent to-transparent",
      mixed: "from-primary-600/5 to-accent-600/5 via-transparent",
    },
    rounded: {
      none: "",
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
    },
  },
  defaultVariants: {
    direction: "toR",
    intensity: "subtle",
    rounded: "xl",
  },
});

export type GradientOverlayProps = VariantProps<typeof gradientOverlay>;

export const decorativeBlob = cva("decorative-animation absolute rounded-full blur-3xl", {
  variants: {
    size: {
      md: "h-64 w-64",
      lg: "h-96 w-96",
    },
    color: {
      primary: "bg-primary-600/20",
      accent: "bg-accent-600/20",
      secondary: "bg-secondary-600/10",
    },
    position: {
      topLeft: "-top-40 -left-40",
      bottomRight: "-right-40 -bottom-40",
      center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    },
  },
  defaultVariants: {
    size: "lg",
    color: "primary",
    position: "topLeft",
  },
});

export type DecorativeBlobProps = VariantProps<typeof decorativeBlob>;

export const primaryGradientButton = cva("flex items-center transition-all", {
  variants: {
    variant: {
      primary: "from-primary-600 to-accent-600 bg-linear-to-r text-fg",
    },
    size: {
      xs: "gap-1 rounded-lg px-2 py-1 text-xs",
      sm: "gap-1.5 rounded-lg px-3 py-1.5 text-xs",
      md: "gap-2 rounded-xl px-4 py-2 text-sm",
      lg: "gap-2 rounded-xl px-6 py-3 text-base",
    },
    glow: {
      primary: "shadow-lg shadow-primary-500/20",
    },
    hover: {
      lighten: "hover:from-primary-500 hover:to-accent-500",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "sm",
    glow: "primary",
    hover: "lighten",
  },
});

export type PrimaryGradientButtonProps = VariantProps<typeof primaryGradientButton>;

export const ghostButton = cva("flex items-center transition-colors", {
  variants: {
    variant: {
      default: "border-fg/10 bg-fg/5 text-fg/60",
      muted: "border-fg/10 bg-fg/5 text-fg/70",
    },
    size: {
      xs: "gap-1 rounded-lg px-2 py-1 text-xs",
      sm: "gap-1.5 rounded-lg px-2 py-1.5 text-xs",
      md: "gap-2 rounded-xl px-4 py-3 text-sm",
    },
    hover: {
      default: "hover:bg-fg/10 hover:text-fg/80",
      lift: "hover:border-fg/20 hover:bg-fg/10 hover:text-fg",
    },
    border: {
      none: "",
      default: "border",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "sm",
    hover: "default",
    border: "default",
  },
});

export type GhostButtonProps = VariantProps<typeof ghostButton>;

export const glassContainer = cva("relative overflow-hidden", {
  variants: {
    blur: {
      none: "bg-surface/20",
      sm: "bg-surface/30 backdrop-blur-sm",
      md: "bg-surface/80 backdrop-blur-md",
      xl: "bg-surface/40 backdrop-blur-xl",
      "2xl": "bg-surface/90 backdrop-blur-2xl",
    },
    rounded: {
      none: "",
      lg: "rounded-lg",
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
    },
    border: {
      none: "",
      default: "border border-fg/10",
      subtle: "border border-fg/5",
    },
    responsive: {
      none: "",
      blur: "sm:backdrop-blur-xl",
      blurMd: "sm:backdrop-blur-md sm:bg-surface/80",
    },
  },
  defaultVariants: {
    blur: "sm",
    rounded: "xl",
    border: "none",
    responsive: "none",
  },
});

export type GlassContainerProps = VariantProps<typeof glassContainer>;

export const modalContent = cva(
  "from-primary-600/15 to-accent-600/15 relative overflow-hidden border bg-linear-to-br shadow-2xl",
  {
    variants: {
      blur: {
        none: "bg-surface/95",
        xl: "bg-surface/90 backdrop-blur-xl",
        "2xl": "bg-surface/90 backdrop-blur-2xl",
      },
      rounded: {
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
      },
      responsive: {
        none: "",
        blur: "sm:backdrop-blur-2xl sm:bg-surface/90",
      },
    },
    defaultVariants: {
      blur: "none",
      rounded: "2xl",
      responsive: "blur",
    },
  }
);

export type ModalContentProps = VariantProps<typeof modalContent>;

export const checkbox = cva("cursor-pointer rounded bg-transparent", {
  variants: {
    size: {
      sm: "h-3.5 w-3.5",
      md: "h-4 w-4",
    },
    color: {
      primary: "border-fg/20 checked:border-primary-600 checked:bg-primary-600 focus:ring-primary-500",
    },
    focus: {
      ring: "focus:ring-2 focus:ring-offset-0",
    },
  },
  defaultVariants: {
    size: "md",
    color: "primary",
    focus: "ring",
  },
});
