import { cva, type VariantProps } from "class-variance-authority";

export const closeButton = cva(
  "absolute z-30 flex size-9 items-center justify-center rounded-full outline-none transition-[background-color,color,border-color] before:absolute before:-inset-1.5 before:content-[''] disabled:pointer-events-none",
  {
    variants: {
      position: {
        topRight: "top-[max(1rem,env(safe-area-inset-top,0px))] right-[max(1rem,env(safe-area-inset-right,0px))]",
      },
      surface: {
        frosted:
          "border border-fg/15 bg-black/40 text-overlay-fg/70 backdrop-blur-md hover:border-fg/25 hover:bg-black/55 hover:text-overlay-fg active:bg-black/70 active:text-overlay-fg",
      },
      focus: {
        accent: "focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 ring-offset-background",
      },
    },
    defaultVariants: {
      position: "topRight",
      surface: "frosted",
      focus: "accent",
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
  "flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-primary-500/50 to-accent-500/50",
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

export const authFieldLabel = cva("text-fg-muted text-xs font-semibold");

export const authInputRow = cva(
  "border-fg/15 bg-fg/[0.04] focus-within:border-primary-500 focus-within:ring-primary-500/30 flex h-11 items-center gap-2 rounded-[0.6875rem] border px-3 transition-colors focus-within:ring-4",
  {
    variants: {
      invalid: {
        true: "border-destructive focus-within:border-destructive focus-within:ring-destructive/30",
        false: "",
      },
    },
    defaultVariants: { invalid: false },
  }
);

export const authInputIcon = cva("text-fg-muted size-[0.9375rem] shrink-0");

export const authInputControl = cva(
  "text-fg placeholder:text-fg-muted h-full w-full border-0 bg-transparent text-sm outline-none"
);

export const authEyeToggle = cva(
  "text-fg-muted hover:text-fg focus-visible:ring-primary-500 -mr-1 flex size-7 shrink-0 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2"
);

export const authEmailButton = cva(
  "border-fg/15 bg-fg/[0.04] text-fg hover:border-fg/25 focus-visible:ring-primary-500 flex h-11 w-full items-center justify-center rounded-[0.6875rem] border text-sm font-bold outline-none transition-colors hover:bg-fg/[0.08] focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
);

export const authPlexButton = cva(
  "border-plex-500/35 text-fg shadow-[0_0_28px_-8px_var(--color-plex-500),inset_0_1px_0_oklch(1_0_0/0.12)] hover:border-plex-500/55 focus-visible:ring-primary-500 flex h-[3.125rem] w-full items-center justify-center gap-2 rounded-[0.8125rem] border bg-plex-500/15 text-[0.9375rem] font-bold outline-none transition-all hover:-translate-y-px hover:bg-plex-500/25 focus-visible:ring-2 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70",
  {
    variants: {
      phase: {
        idle: "",
        pending: "",
        completed: "border-[oklch(var(--neon-success)/0.55)]",
        error: "border-destructive/60",
      },
    },
    defaultVariants: { phase: "idle" },
  }
);

export const authPlexIcon = cva("text-plex-400 size-[1.125rem] shrink-0", {
  variants: {
    phase: {
      idle: "",
      pending: "",
      completed: "text-[oklch(var(--neon-success))]",
      error: "text-destructive",
    },
  },
  defaultVariants: { phase: "idle" },
});

export const authPlexWord = cva("text-plex-400 font-extrabold");

export const authForwardButton = cva(
  "focus-visible:ring-primary-500 flex h-11 w-full items-center justify-center gap-2 rounded-[0.6875rem] border text-sm font-bold outline-none transition-all focus-visible:ring-2 sm:w-auto sm:px-6",
  {
    variants: {
      blocked: {
        true: "border-fg/20 bg-fg/[0.06] text-fg-muted cursor-not-allowed",
        false:
          "border-primary-500/40 bg-primary-500/20 text-fg shadow-[0_0_28px_-8px_var(--color-primary-500),inset_0_1px_0_oklch(1_0_0/0.12)] hover:border-primary-500/60 hover:-translate-y-px hover:bg-primary-500/30",
      },
    },
    defaultVariants: { blocked: false },
  }
);

export const authQuietButton = cva(
  "border-fg/15 bg-fg/[0.04] text-fg hover:border-fg/25 focus-visible:ring-primary-500 flex h-11 w-full items-center justify-center rounded-[0.6875rem] border text-sm font-semibold outline-none transition-colors hover:bg-fg/[0.08] focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-5"
);
