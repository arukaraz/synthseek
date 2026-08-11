import { cva, type VariantProps } from "class-variance-authority";

export const resultCard = cva("group relative cursor-pointer overflow-hidden rounded-lg transition-all duration-300", {
  variants: {
    hover: {
      lift: "hover:-translate-y-1 hover:shadow-xl",
      scale: "hover:scale-[1.02]",
    },
  },
  defaultVariants: {
    hover: "lift",
  },
});

export type ResultCardProps = VariantProps<typeof resultCard>;

export const cardImagePlaceholder = cva("flex h-full w-full items-center justify-center bg-linear-to-br", {
  variants: {
    gradient: {
      primary: "from-primary-500/30 to-accent-500/30",
      subtle: "from-primary-500/20 to-accent-500/20",
    },
  },
  defaultVariants: {
    gradient: "primary",
  },
});

export type CardImagePlaceholderProps = VariantProps<typeof cardImagePlaceholder>;

export const cardInfo = cva("absolute inset-x-0 bottom-0 p-3", {
  variants: {
    gradient: {
      dark: "bg-linear-to-t from-black/90 via-black/60 to-transparent",
    },
  },
  defaultVariants: {
    gradient: "dark",
  },
});

export type CardInfoProps = VariantProps<typeof cardInfo>;

export const cardHoverBorder = cva(
  "absolute inset-0 rounded-lg border-2 border-transparent transition-all duration-300",
  {
    variants: {
      color: {
        primary: "group-hover:border-primary-500/50 group-hover:glow-primary",
      },
    },
    defaultVariants: {
      color: "primary",
    },
  }
);

export type CardHoverBorderProps = VariantProps<typeof cardHoverBorder>;

export const configHeader = cva("absolute inset-0 flex items-center justify-center rounded-t-2xl bg-linear-to-br", {
  variants: {
    gradient: {
      primary: "from-primary-500/30 to-accent-500/30",
    },
  },
  defaultVariants: {
    gradient: "primary",
  },
});

export type ConfigHeaderProps = VariantProps<typeof configHeader>;

export const modalContainer = cva(
  "h-modal-max bg-surface/95 sm:bg-surface/90 sm:backdrop-blur-2xl !flex flex-col gap-0 overflow-hidden p-0 shadow-2xl",
  {
    variants: {
      size: {
        lg: "max-w-4xl",
      },
    },
    defaultVariants: {
      size: "lg",
    },
  }
);

export type ModalContainerProps = VariantProps<typeof modalContainer>;

export const backButton = cva("flex items-center gap-2 text-sm transition-colors", {
  variants: {
    color: {
      muted: "text-fg/60 hover:text-fg",
    },
    spacing: {
      mb3: "mb-3",
    },
  },
  defaultVariants: {
    color: "muted",
    spacing: "mb3",
  },
});

export type BackButtonProps = VariantProps<typeof backButton>;

export const cardTitle = cva("text-overlay-fg line-clamp-2 leading-tight font-semibold mb-1 text-base sm:text-lg", {
  variants: {},
  defaultVariants: {},
});

export type CardTitleProps = VariantProps<typeof cardTitle>;

export const filterTabsContainer = cva("mb-4 flex items-center gap-2 overflow-x-auto px-4 sm:px-6", {
  variants: {},
  defaultVariants: {},
});

export type FilterTabsContainerProps = VariantProps<typeof filterTabsContainer>;
