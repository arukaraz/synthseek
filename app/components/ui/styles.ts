import { cva, type VariantProps } from "class-variance-authority";

export const closeButton = cva(
  "absolute z-20 rounded-lg p-1.5 transition-all focus:outline-none disabled:pointer-events-none",
  {
    variants: {
      position: {
        topRight: "top-4 right-4",
      },
      color: {
        muted: "text-fg/40 hover:bg-fg/10 hover:text-fg",
      },
      focus: {
        primary: "ring-offset-background focus:ring-primary-500/50 focus:ring-2 focus:ring-offset-2",
      },
      state: {
        openBg: "data-[state=open]:bg-fg/5",
      },
    },
    defaultVariants: {
      position: "topRight",
      color: "muted",
      focus: "primary",
      state: "openBg",
    },
  }
);

export type CloseButtonProps = VariantProps<typeof closeButton>;

export const dialogOverlay = cva(
  "fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  {
    variants: {
      blur: {
        none: "bg-surface/90",
        md: "bg-surface/80 backdrop-blur-md",
      },
      responsive: {
        blur: "sm:bg-surface/80 sm:backdrop-blur-md",
      },
    },
    defaultVariants: {
      blur: "none",
      responsive: "blur",
    },
  }
);

export type DialogOverlayProps = VariantProps<typeof dialogOverlay>;

export const dialogContent = cva(
  "border-fg/10 fixed left-1/2 z-50 grid w-full -translate-x-1/2 gap-6 rounded-2xl border p-6 shadow-2xl duration-200",
  {
    variants: {
      blur: {
        none: "bg-surface/95",
        "2xl": "bg-surface/90 backdrop-blur-2xl",
      },
      responsive: {
        blur: "sm:bg-surface/90 sm:backdrop-blur-2xl",
      },
      size: {
        default: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
      },
    },
    defaultVariants: {
      blur: "none",
      responsive: "blur",
      size: "default",
    },
  }
);

export type DialogContentProps = VariantProps<typeof dialogContent>;

export const footerActions = cva("relative flex items-center gap-3 border-t p-6 pt-4", {
  variants: {
    bg: {
      subtle: "border-fg/5 bg-fg/5",
    },
    blur: {
      sm: "sm:backdrop-blur-sm",
    },
  },
  defaultVariants: {
    bg: "subtle",
    blur: "sm",
  },
});

export type FooterActionsProps = VariantProps<typeof footerActions>;

export const checkboxInput = cva("cursor-pointer rounded bg-transparent focus:ring-2 focus:ring-offset-0", {
  variants: {
    size: {
      sm: "h-3.5 w-3.5",
      md: "h-4 w-4",
    },
    color: {
      primary: "border-fg/20 checked:border-primary-600 checked:bg-primary-600 focus:ring-primary-500",
    },
  },
  defaultVariants: {
    size: "md",
    color: "primary",
  },
});

export type CheckboxInputProps = VariantProps<typeof checkboxInput>;

export const dropdownItem = cva(
  "relative flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors select-none",
  {
    variants: {
      state: {
        default: "text-fg data-[highlighted]:bg-primary-500/10 data-[highlighted]:text-fg",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

export type DropdownItemProps = VariantProps<typeof dropdownItem>;

export const modalCenterContainer = cva("pointer-events-none fixed inset-0 flex items-center justify-center p-4", {
  variants: {
    z: {
      modal: "z-9999",
      dialog: "z-50",
    },
  },
  defaultVariants: {
    z: "modal",
  },
});

export type ModalCenterContainerProps = VariantProps<typeof modalCenterContainer>;

export const circularImagePlaceholder = cva(
  "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary-500/50 to-accent-500/50",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type CircularImagePlaceholderProps = VariantProps<typeof circularImagePlaceholder>;

export const headerSearchInput = cva(
  "text-fg placeholder-fg/30 w-full rounded-xl bg-transparent py-2.5 pr-8 pl-10 text-sm outline-none",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type HeaderSearchInputProps = VariantProps<typeof headerSearchInput>;

export const responsiveFallbackIcon = cva("", {
  variants: {
    size: {
      fill: "text-fg/30 h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16",
      sm: "text-primary-400 h-8 w-8",
    },
  },
  defaultVariants: {
    size: "fill",
  },
});

export type ResponsiveFallbackIconProps = VariantProps<typeof responsiveFallbackIcon>;
